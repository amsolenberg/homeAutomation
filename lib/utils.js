import cron from 'node-cron';
import { callService, getState } from './ha-rest.js';
import { log } from './logger.js';

// Get current time (hour only)
export function getCurrentHour() {
    return new Date().getHours();
}

// Determine if current time falls within a time window
export function isTimeInRange(startHour, endHour) {
    const hour = getCurrentHour();
    if (startHour <= endHour) {
        return hour >= startHour && hour < endHour;
    } else {
        // Handles ranges that cross midnight (i.e., 22 to 05)
        return hour >= startHour || hour < endHour;
    }
}

// Force entity state on/off during scheduled range
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

// Run task on cron schedule
/**
 *
 * @param {string} schedule cron schedule (e.g., '0 5 * * *' for daily at 0500)
 * @param {string} entity Entity upon which the schedule will act
 * @param {string} [domain='switch'] Entity domain (e.g., 'switch', 'input_boolean')
 * @param {string} service Doman service (e.g., 'turn_on', turn_off')
 * @param {string} [label='unnamed task'] Label to appear in logs
 */
export function cronSchedule(schedule = '', entity = '', domain = 'switch', service = '', label = 'unnamed task') {
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

// Weekday/Weekend check
export function isWeekend() {
    const day = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    return day === 0 || day === 6;
}

// Timetamp for logs
export function getTimestamp() {
    const time = new Date().toLocaleTimeString('en-GB');
    return `[${time}]`;
}
