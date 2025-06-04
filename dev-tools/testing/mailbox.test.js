import { getState } from '../../lib/ha-rest.js';
import { log } from '../../lib/logger.js';

async function getFlagState(entity = '') {
    try {
        const flag = await getState(entity);
        const flagState = flag?.state === 'on';
        console.log(flagState);
    } catch (e) {
        log('error', 'Mailbox', `getFlagState error:\n${e.message || e}`);
    }
}

getFlagState('input_boolean.toggle_notification_mail_collected');
