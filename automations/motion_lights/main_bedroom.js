import { callHAService, subscribeToStates } from '../../lib/ha-websocket.js';

const MOTION_SENSOR = 'binary_sensor.motion_main_bedroom_occupancy';
const LIGHT_ENTITY = 'light.group_light_main_bedroom_lights';
const OFF_DELAY_MINUTES = 0;

let offTimer = null;
let offTimerEndsAt = null;
let lastMotionState = null;

function getBrightnessPercentage(hour) {
    if (hour >= 6 && hour <= 8) return 30; // Morning
    if (hour >= 9 && hour <= 18) return 70; // Midday
    if (hour >= 19 && hour <= 22) return 40; // Evening
    return 10; // Night
}

function turnLightOn() {
    const hour = new Date().getHours();
    const brightness = getBrightnessPercentage(hour);

    return callHAService(
        'light',
        'turn_on',
        {
            brightness_pct: brightness,
            kelvin: 6500
        },
        {
            entity_id: LIGHT_ENTITY
        }
    );
}

function turnLightOff() {
    return callHAService(
        'light',
        'turn_off',
        {
            // transition: 30
        },
        {
            entity_id: LIGHT_ENTITY
        }
    );
}

async function handleMotionStateChange(state) {
    if (state === 'on') {
        if (offTimer) {
            clearTimeout(offTimer);
            offTimer = null;
            offTimerEndsAt = null;
            console.log('[Motion Automation] Timer cancelled due to new motion.');
        }
        try {
            await turnLightOn();
            console.log('[Motion Automation] Light turned ON');
        } catch (e) {
            console.error('[Motion Automation] Failed to turn light ON:', e.message || e);
        }
    } else if (state === 'off') {
        if (!offTimer) {
            offTimerEndsAt = Date.now() + OFF_DELAY_MINUTES * 60 * 1000;
            offTimer = setTimeout(async () => {
                try {
                    await turnLightOff();
                    console.log('[Motion Automation] Light turned OFF');
                } catch (e) {
                    console.error('[Motion Automation] Failed to turn light OFF:', e.message || e);
                }
                offTimer = null;
                offTimerEndsAt = null;
            }, OFF_DELAY_MINUTES * 60 * 1000);
            console.log(`[Motion Automation] Timer started to turn light off in ${OFF_DELAY_MINUTES} minutes.`);
        }
    }
}

export function setupMainBedroomMotionAutomation() {
    subscribeToStates(async (entities) => {
        const state = entities[MOTION_SENSOR]?.state;

        if ((state === 'on' || state === 'off') && state !== lastMotionState) {
            console.log(`[Motion Automation] ${MOTION_SENSOR} state: ${state}`);
            lastMotionState = state;
            await handleMotionStateChange(state);
        }
    });

    setInterval(() => {
        if (offTimer && offTimerEndsAt) {
            const remaining = Math.max(0, offTimerEndsAt - Date.now());
            console.log(`[Motion Automation] Light will turn off in ${Math.ceil(remaining / 1000)} seconds`);
        }
    }, 10000);
}
