import { cronScheduleService, isWeekend, isTimeInRange, isOnDuty, cronScheduleFn } from '../../lib/utils.js';
import { callService, getState } from '../../lib/ha-rest.js';
import { ntfy } from '../../lib/ntfy.js';
import { log } from '../../lib/logger.js';
import { onAction, sendActionNotification } from '../../lib/action_notifications.js';

const portableAC = 'switch.outlet_main_bedroom_portable_ac';
const acTonightSwitch = 'input_boolean.toggle_status_main_bedroom_portable_ac';
const overrideSwitch = 'input_boolean.toggle_status_portable_ac_override';
const doorSensor = 'binary_sensor.contact_main_bedroom_door_contact';

let lastDoorOpenNotification = 0;
const NOTIFY_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes

export function acTonightReset() {
    cronScheduleService('0 12 * * *', acTonightSwitch, 'input_boolean', 'turn_on', 'acTonight Reset at 1200');
}

export function acTonightNotification() {
    cronScheduleFn(
        '0 18 * * *',
        async () => {
            if (await isOnDuty()) {
                await sendActionNotification({
                    device: 'mobile_app_tls_phone',
                    title: 'AC',
                    message: 'Do you want the AC to run tonight?',
                    actionsArray: [
                        { action: 'ENABLE_AC', title: 'Yes' },
                        { action: 'DISABLE_AC', title: 'No' }
                    ],
                    persistent: true,
                    tag: 'ac_prompt'
                });
            }
        },
        'acTonightNotification at 1800'
    );
}

export function acRunScheduler() {
    setInterval(acRun, 60 * 1000); // Run every minute
}

async function maybeNotifyDoorOpen(now) {
    if (now - lastDoorOpenNotification > NOTIFY_COOLDOWN_MS) {
        await ntfy({
            channel: 'haos',
            title: 'AC',
            message: 'The main bedroom door was left open.'
        });
        lastDoorOpenNotification = now;
    }
}

async function acRun() {
    const startTime = 19;
    const endTime = isWeekend() ? 9 : 8;
    const inTimeRange = isTimeInRange(startTime, endTime);

    try {
        const [overrideState, acTonightState, doorState, acState] = await Promise.all([
            getState(overrideSwitch),
            getState(acTonightSwitch),
            getState(doorSensor),
            getState(portableAC)
        ]);

        if (overrideState.state === 'on') return; // Skip all logic if override is on

        if (inTimeRange) {
            if (acTonightState.state === 'on') {
                if (doorState.state === 'off') {
                    if (acState.state !== 'on') {
                        await callService('switch', 'turn_on', { entity_id: portableAC });
                        log('info', 'Portable AC', 'Turned ON (AC Tonight + Door Closed)');
                    }
                } else {
                    const now = Date.now();
                    if (acState.state !== 'off') {
                        await callService('switch', 'turn_off', { entity_id: portableAC });
                        log('warn', 'Portable AC', 'Turned OFF (Door Open)');
                        await maybeNotifyDoorOpen(now);
                    } else {
                        await maybeNotifyDoorOpen(now);
                    }
                }
            } else {
                if (acState.state !== 'off') {
                    await callService('switch', 'turn_off', { entity_id: portableAC });
                    log('warn', 'Portable AC', 'Turned OFF (AC Tonight is OFF)');
                }
            }
        } else {
            if (acState.state !== 'off') {
                await callService('switch', 'turn_off', { entity_id: portableAC });
                log('info', 'Portable AC', 'Turned OFF (Outside runtime window');
            }
        }
    } catch (e) {
        log('error', 'Portable AC', `Automation error:\n${e.message || e}`);
    }
}

onAction('ENABLE_AC', async () => {
    await callService('input_boolean', 'turn_on', {
        entity_id: acTonightSwitch
    });
});

onAction('DISABLE_AC', async () => {
    await callService('input_boolean', 'turn_off', {
        entity_id: acTonightSwitch
    });
    await callService('notify', 'mobile_app_tls_phone', {
        title: 'Portable AC',
        message: 'Okay, the AC will not turn on.'
    });
});
