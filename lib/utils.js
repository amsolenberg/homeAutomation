import cron from 'node-cron';
import { callService, getState } from './ha-rest.js';
import { log } from './logger.js';

// Returns the current hour (0-23)
export function getCurrentHour() {
    return new Date().getHours();
}

// Checks if the current hour falls within a given range (inclusive start, exclusive end)
export function isTimeInRange(startHour, endHour) {
    const hour = getCurrentHour();
    return startHour <= endHour ? hour >= startHour && hour < endHour : hour >= startHour || hour < endHour;
}

/**
 * Ensures an entity is ON during a defined time range, and OFF otherwise.
 * Checks once per minute and acts only if the current state is incorrect.
 */
export function enforceStateDuringRange(startTime, endTime, entity, domain = 'switch') {
    log('info', 'Enforcer', `Enforcing ${entity} from ${startTime}:00 to ${endTime}:00 (${domain})`);

    setInterval(async () => {
        const current = await getState(entity);
        const inTimeRange = isTimeInRange(startTime, endTime);

        if (!inTimeRange) {
            try {
                if (current.state !== 'off') {
                    await callService(domain, 'turn_off', {
                        entity_id: entity
                    });
                    log('info', 'Enforcer', `Turned OFF ${entity} (was ${current.state})`);
                }
            } catch (e) {
                log('error', 'Enforcer', `Error checking ${entity}:\n${e.message || e}`);
            }
        } else {
            try {
                if (current.state !== 'on') {
                    await callService(domain, 'turn_on', {
                        entity_id: entity
                    });
                    log('info', 'Enforcer', `Turned ON ${entity} (was ${current.state})`);
                }
            } catch (e) {
                log('error', 'Enforcer', `Error checking ${entity}:\n${e.message || e}`);
            }
        }
    }, 60 * 1000);
}

/**
 * Sets up multiple time-based enforcers to ensure an entity is ON during defined ranges,
 * and OFF at all other times.
 * Checks once per minute and acts only if the current state is incorrect.
 *
 * @param {Array<Array<number>>} ranges - Array of [startHour, endHour] pairs (24h format)
 * @param {string} entity - The entity ID to control (e.g. 'switch.living_room_lamp')
 * @param {string} domain - The domain for the entity (default: 'switch')
 */
export function enforceStateDuringRanges(ranges, entity, domain = 'switch') {
    log(
        'info',
        'Enforcer',
        `Enforcing ${entity} during ranges: ${ranges.map(([s, e]) => `${s}:00-${e}:00`).join(', ')} (${domain})`
    );

    setInterval(async () => {
        const current = await getState(entity);
        const nowInRange = ranges.some(([start, end]) => isTimeInRange(start, end));

        try {
            if (nowInRange && current.state !== 'on') {
                await callService(domain, 'turn_on', { entity_id: entity });
                log('info', 'Enforcer', `Turned ON ${entity} (was ${current.state})`);
            } else if (!nowInRange && current.state !== 'off') {
                await callService(domain, 'turn_off', { entity_id: entity });
                log('info', 'Enforcer', `Turned OFF ${entity} (was ${current.state})`);
            }
        } catch (e) {
            log('error', 'Enforcer', `Error checking ${entity}:\n${e.message || e}`);
        }
    }, 60 * 1000);
}

/**
 * Runs a Home Assistant service call on a cron-based schedule.
 * Useful for scheduled automations (e.g., turning something off every night at 11pm).
 */
export function cronScheduleService(schedule = '', entity, domain = 'switch', service = '', label = 'unnamed task') {
    log('info', 'CRON', `Scheduled - '${label}'`);
    cron.schedule(schedule, async () => {
        try {
            await callService(domain, service, {
                entity_id: entity
            });
            log('info', 'CRON', `'${label}' ran successfully.`);
        } catch (e) {
            log('error', 'CRON', `'${label}' failed:\n${e.message || e}`);
        }
    });
}

/**
 * Runs a custom function on a cron-based schedule.
 * Useful for non-service-based scheduled logic.
 */
export function cronScheduleFn(schedule = '', fn, label = 'unnamed task') {
    log('info', 'CRON', `Scheduled function - '${label}'`);
    cron.schedule(schedule, async () => {
        try {
            await fn();
            log('info', 'CRON', `Function '${label}' ran successfully.`);
        } catch (e) {
            log('error', 'CRON', `Function '${label}' failed:\n${e.message || e}`);
        }
    });
}

// Returns true if today is Saturday or Sunday
export function isWeekend() {
    const day = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    return day === 0 || day === 6;
}

// Returns a timestamp in [HH:mm:ss] format for logging
export function getTimestamp() {
    const time = new Date().toLocaleTimeString('en-GB');
    return `[${time}]`;
}

// Checks if the on-duty input_boolean is ON
export async function isOnDuty() {
    const onDutyFlag = 'input_boolean.toggle_notification_on_shift';
    const onDuty = await getState(onDutyFlag);
    return onDuty?.state === 'on';
}
