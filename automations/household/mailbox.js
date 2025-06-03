import { callService, getState } from '../../lib/ha-rest.js';
import { subscribeToStates } from '../../lib/ha-websocket.js';
import { ntfy } from '../../lib/ntfy.js';
import { log } from '../../lib/logger.js';
import { cronSchedule } from '../../lib/utils.js';

const mailCollectedFlag = 'input_boolean.toggle_notification_mail_collected';
const mailDeliveredFlag = 'input_boolean.toggle_notification_mail_delivered';
const mailDeliveredOldFlag = 'input_boolean.toggle_notification_mail_delivered_old';
const mailboxFrontDoor = 'binary_sensor.contact_mailbox_front_contact';
const mailboxRearDoor = 'binary_sensor.contact_mailbox_rear_contact';

// Reset mail status flags
export function mailStatusReset() {
    cronSchedule('0 4 * * *', mailCollectedFlag, 'input_boolean', 'turn_off', 'Mail collected flag reset');
    cronSchedule('0 4 * * *', mailDeliveredFlag, 'input_boolean', 'turn_off', 'Mail delivered flag reset');
}

export async function getMailDeliveredState() {
    try {
        const isMailDelivered = await getState(mailDeliveredFlag);
        return isMailDelivered.state;
    } catch (e) {
        log('error', 'Mailbox', `getMailDeliveredState error:\n${e.message || e}`);
    }
}
