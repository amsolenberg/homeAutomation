import { callService, getState } from '../../lib/ha-rest.js';
import { subscribeToStates } from '../../lib/ha-websocket.js';
import { log } from '../../lib/logger.js';
import { ntfy } from '../../lib/ntfy.js';

const doorContactSensor = 'binary_sensor.contact_front_door_contact';
const doorLock = 'lock.front_door';

async function isDoorClosed() {
    const doorState = await getState(doorContactSensor);
    return doorState?.state === 'off';
}

async function isLockLocked() {
    const lockState = await getState(doorLock);
    return lockState?.state === 'locked';
}

let lockTimeout = null;
async function handleDoorClosed() {
    log('debug', 'Front Door', 'Sensor state: closed');

    if (lockTimeout) clearTimeout(lockTimeout);
    lockTimeout = setTimeout(async () => {
        lockTimeout = null;
        if ((await isDoorClosed()) && !(await isLockLocked())) {
            await callService('lock', 'lock', {
                entity_id: doorLock
            });
        }
    }, 30 * 1000);
}

let lastLockState = null;
function handleLockState(lockState) {
    if (lockState !== lastLockState) {
        lastLockState = lockState;
        log('info', 'Front Door', `Lock state changed: ${lockState}`);
        ntfy({
            channel: 'haos',
            title: '🚪Front Door',
            message: `The front door was ${lockState}.`
        });
    }
}

let subscribed = false;
export function monitorDoorLock() {
    if (subscribed) return;
    subscribed = true;

    subscribeToStates(async (entities) => {
        const doorState = entities[doorContactSensor]?.state;
        if (doorState === 'off') {
            handleDoorClosed();
        }

        const lockState = entities[doorLock]?.state;
        if (lockState) {
            handleLockState(lockState);
        }
    });
}
