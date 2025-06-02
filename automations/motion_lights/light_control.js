import { subscribeToStates } from '../../lib/ha-websocket.js';
import { callService } from '../../lib/ha-rest.js';
import { getTimestamp } from '../../lib/utils.js';

let offTimers = new Map();
let offTimerEnds = new Map();

// Determine the time of day
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

// Determine brightness based on time
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
        throw new Error(`Invalid light service: ${service}`);
    }
}

async function handleMotionStateChange(room, entity, state, offDelayMinutes, log) {
    if (state === 'on') {
        if (offTimers.has(entity)) {
            clearTimeout(offTimers.get(entity));
            offTimers.delete(entity);
            offTimerEnds.delete(entity);
            if (log) {
                console.log(`${getTimestamp()} [Motion Automation] ${room} light timer cancelled due to new motion.`);
            }
        }
        try {
            await changeLightState(entity, 'turn_on');
            if (log) {
                console.log(`${getTimestamp()} [Motion Automation] ${room} light turned ON`);
            }
        } catch (e) {
            console.error(`${getTimestamp()} [Motion Automation] Failed to turn ${room} light ON:`, e.message || e);
        }
    } else if (state === 'off') {
        if (!offTimers.has(entity)) {
            const timeout = setTimeout(async () => {
                try {
                    await changeLightState(entity, 'turn_off');
                    if (log) {
                        console.log(`${getTimestamp()} [Motion Automation] ${room} light turned OFF`);
                    }
                } catch (e) {
                    console.error(
                        `${getTimestamp()} [Motion Automation] Failed to turn ${room} light OFF:`,
                        e.message || e
                    );
                }
                offTimers.delete(entity);
                offTimerEnds.delete(entity);
            }, offDelayMinutes * 60 * 1000);

            offTimers.set(entity, timeout);
            offTimerEnds.set(entity, Date.now() + offDelayMinutes * 60 * 1000);
            if (log) {
                console.log(
                    `${getTimestamp()} [Motion Automation] ${room} light timer started to turn light off in ${offDelayMinutes} minutes.`
                );
            }
        }
    }
}

function getRemainingTime(entity) {
    const endsAt = offTimerEnds.get(entity);
    if (!endsAt) return 0;
    return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
}

export function setupMotionLightAutomation({ room, sensor, lightEntity, offDelayMinutes = 5, log = false }) {
    let lastMotionState = null;

    subscribeToStates(async (entities) => {
        const state = entities[sensor]?.state;

        if ((state === 'on' || state === 'off') && state !== lastMotionState) {
            if (log) {
                console.log(`${getTimestamp()} [Motion Automation] ${room} motion state: ${state}`);
            }
            lastMotionState = state;
            await handleMotionStateChange(room, lightEntity, state, offDelayMinutes, log);
        }
    });

    if (log) {
        setInterval(() => {
            const remaining = getRemainingTime(lightEntity);
            if (remaining > 0) {
                console.log(
                    `${getTimestamp()} [Motion Automation] ${room} light will turn off in ${remaining} seconds`
                );
            }
        }, 10000);
    }
}
