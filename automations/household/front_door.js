import { callService, getState } from '../../lib/ha-rest.js';
import { subscribeToStates } from '../../lib/ha-websocket.js';
import { log } from '../../lib/logger.js';
import { ntfy } from '../../lib/ntfy.js';

const doorContactSensor = 'binary_sensor.contact_front_door_contact';
const doorLock = 'lock.front_door';
const personName = 'sensor.front_door_person_name';

export async function getPersonName() {
    try {
        await new Promise((resolve) => setTimeout(resolve, 2 * 1000));

        const { state: name } = await getState(personName);

        if (name === 'No Person') {
            return null;
        } else if (name === 'euf***') {
            return 'Aaron';
        } else if (name === 'has***') {
            return 'an automation';
        } else {
            return name.split(' ')[0];
        }
    } catch (e) {
        log('error', 'Front Door', `getPersonName() error:\n${e.message || e}`);
    }
}

// Returns true if the door is closed (contact sensor is 'off')
async function isDoorClosed() {
    const doorState = await getState(doorContactSensor);
    return doorState?.state === 'off';
}

// Returns true if the lock is currently in the 'locked' state
async function isLockLocked() {
    const lockState = await getState(doorLock);
    return lockState?.state === 'locked';
}

let lockTimeout = null;
/**
 * Called when the door is detected as closed.
 * If still closed after 30 seconds and not locked, lock it automatically.
 */
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
/**
 * Handles lock state changes to avoid duplicate logs/notifications.
 */
export async function handleLockState(lockState) {
    if (lockState !== lastLockState) {
        lastLockState = lockState;
        const person = await getPersonName();
        if (person != null) {
            log('alert', 'Front Door', `The front door was ${lockState} by ${person}`);
        } else {
            log('alert', 'Front Door', `The front door was ${lockState}`);
        }
    }
}

let subscribed = false;
/**
 * Subscribes to state changes for both the door sensor and lock.
 * Initiates delayed auto-lock and sends lock status notifications.
 */
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
