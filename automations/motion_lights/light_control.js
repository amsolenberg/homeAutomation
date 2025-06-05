import { subscribeToStates } from '../../lib/ha-websocket.js';
import { callService, getState } from '../../lib/ha-rest.js';
import { log } from '../../lib/logger.js';

let offTimers = new Map(); // Tracks active off-delay timers per entity
let offTimerEnds = new Map(); // Tracks when each timer is scheduled to end

// Returns the general time of day (used for brightness control)
function getTimeOfDay() {
    const hour = new Date().getHours();

    if (hour >= 6 && hour <= 8) {
        return 'morning';
    } else if (hour >= 9 && hour <= 18) {
        return 'midday';
    } else if (hour >= 19 && hour <= 22) {
        return 'evening';
    } else if (hour >= 23 || hour <= 5) {
        return 'night';
    }
}

// Returns brightness percentage based on time of day
function getBrightnessPercentage() {
    const timeOfDay = getTimeOfDay();
    return (
        {
            morning: 30,
            midday: 70,
            evening: 40,
            night: 10
        }[timeOfDay] ?? 50
    );
}

// Changes a light's state to ON or OFF with context-specific settings
function changeLightState(entity, service) {
    if (service === 'turn_on') {
        const brightness = getBrightnessPercentage();
        return callService('light', service, {
            entity_id: entity,
            brightness_pct: brightness,
            kelvin: 6500
        });
    } else if (service === 'turn_off') {
        return callService('light', service, {
            entity_id: entity,
            transition: 30
        });
    } else {
        log('error', 'changeLightState', `Invalid light service: ${service}`);
        throw new Error(`Invalid light service: ${service}`);
    }
}

// Responds to motion sensor state changes to control the light
async function handleMotionStateChange(room, entity, state, offDelayMinutes) {
    if (state === 'on') {
        if (offTimers.has(entity)) {
            clearTimeout(offTimers.get(entity));
            offTimers.delete(entity);
            offTimerEnds.delete(entity);
            log('debug', 'Motion', `${room} light timer cancelled due to new motion`);
        }
        try {
            await changeLightState(entity, 'turn_on');
            log('debug', 'Motion', `${room} light turned ON`);
        } catch (e) {
            log('error', 'Motion', `Failed to turn ${room} light ON:\n${e.message || e}`);
        }
    } else if (state === 'off') {
        if (!offTimers.has(entity)) {
            const timeout = setTimeout(async () => {
                try {
                    await changeLightState(entity, 'turn_off');
                    log('debug', 'Motion', `${room} light turned OFF`);
                } catch (e) {
                    log('error', 'Motion', `Failed to turn ${room} light OFF:\n${e.message || e}`);
                }
                offTimers.delete(entity);
                offTimerEnds.delete(entity);
            }, offDelayMinutes * 60 * 1000);

            offTimers.set(entity, timeout);
            offTimerEnds.set(entity, Date.now() + offDelayMinutes * 60 * 1000);
            log('debug', 'Motion', `${room} light timer started to turn light off in ${offDelayMinutes} minutes`);
        }
    }
}

// Returns seconds remaining before a light is scheduled to turn off
function getRemainingTime(entity) {
    const endsAt = offTimerEnds.get(entity);
    if (!endsAt) return 0;
    return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
}

/**
 * Sets up motion-activated lighting automation.
 *
 * @param {Object} params
 * @param {string} params.room - Name of the room (for logging/debugging).
 * @param {string} params.sensor - Entity ID of the motion sensor.
 * @param {string|string[]} params.lightEntity - Entity ID(s) of the light(s) to control.
 * @param {number} [params.offDelayMinutes=5] - Time in minutes before turning off lights after no motion.
 * @param {string|null} [params.enabledEntity=null] - Optional entity that controls whether the automation is enabled.
 */
export function setupMotionLightAutomation({ room, sensor, lightEntity, offDelayMinutes = 5, enabledEntity = null }) {
    let lastMotionState = null;

    subscribeToStates(async (entities) => {
        const state = entities[sensor]?.state;

        if ((state === 'on' || state === 'off') && state !== lastMotionState) {
            // Check if automation is enabled
            if (enabledEntity) {
                try {
                    const enabledState = await getState(enabledEntity);
                    if (enabledState.state !== 'on') {
                        log('debug', 'Motion', `${room} automation is disabled — ignoring motion`);
                        return;
                    }
                } catch (e) {
                    log('error', 'Motion', `Failed to check enable status for ${room}:\n${e.message || e}`);
                    return;
                }
            }

            log('debug', 'Motion', `${room} motion state: ${state}`);

            lastMotionState = state;
            await handleMotionStateChange(room, lightEntity, state, offDelayMinutes);
        }
    });

    // Log remaining time every 10 seconds for visibility
    setInterval(() => {
        const remaining = getRemainingTime(lightEntity);
        if (remaining > 0) {
            log('debug', 'Motion', `${room} light will turn off in ${remaining} seconds`);
        }
    }, 10000);
}
