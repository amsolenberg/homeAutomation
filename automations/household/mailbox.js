import { callService, getState } from '../../lib/ha-rest.js';
import { subscribeToStates } from '../../lib/ha-websocket.js';
import { ntfy } from '../../lib/ntfy.js';
import { log } from '../../lib/logger.js';
import { cronSchedule } from '../../lib/utils.js';

const mailCollectedFlag = 'input_boolean.toggle_notification_mail_collected';
const mailDeliveredFlag = 'input_boolean.toggle_notification_mail_delivered';
// const mailDeliveredOldFlag = 'input_boolean.toggle_notification_mail_delivered_old';
const mailboxFrontDoor = 'binary_sensor.contact_mailbox_front_contact';
const mailboxRearDoor = 'binary_sensor.contact_mailbox_rear_contact';

// Reset mail status flags
export function mailStatusReset() {
    cronSchedule('0 4 * * *', mailCollectedFlag, 'input_boolean', 'turn_off', 'Mail collected flag reset at 0400');
    cronSchedule('0 4 * * *', mailDeliveredFlag, 'input_boolean', 'turn_off', 'Mail delivered flag reset at 0400');
}

async function getFlagState(entity = '') {
    try {
        const flag = await getState(entity);
        return flag?.state === 'on';
    } catch (e) {
        log('error', 'Mailbox', `getFlagState error:\n${e.message || e}`);
    }
}

async function setFlagState(entity = '', state = '') {
    try {
        await callService('input_boolean', state.toLowerCase(), {
            entity_id: entity
        });
    } catch (e) {
        log('error', 'Mailbox', `setFlagState error:\n${e.message || e}`);
    }
}

function monitorMailStatus(sensor = '', flag = '') {
    subscribeToStates(async (entities) => {
        const state = entities[sensor]?.state;
        if (state === 'on') {
            log('debug', 'Mailbox', `${sensor} sensor state: ${state}`);

            if (sensor === mailboxRearDoor) {
                const mailDelievered = await getFlagState(mailDeliveredFlag);
                if (!mailDelievered) {
                    log('info', 'Mailbox', 'Rear door opened but mail has not yet been marked as delivered');
                    return;
                }
            }

            const flagState = await getFlagState(flag);
            if (!flagState) {
                await setFlagState(flag, 'turn_on');
                log('info', 'Mailbox', `Mail has been ${sensor === mailboxFrontDoor ? 'delivered' : 'collected'}`);
                ntfy({
                    channel: 'haos',
                    title: 'Mailbox',
                    message: `Mail has been ${sensor === mailboxFrontDoor ? 'delivered' : 'collected'}`
                });
            }
        }
    });
}

export function monitorMailbox() {
    monitorMailStatus(mailboxFrontDoor, mailDeliveredFlag);
    monitorMailStatus(mailboxRearDoor, mailCollectedFlag);
}
