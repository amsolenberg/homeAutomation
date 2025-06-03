import { runWithHA } from './harness.js';
import { log } from '../../lib/logger.js';
import { getFlagState } from '../../automations/household/mailbox.js'; // No longer exported

const label = 'getFlagState';
const fn = getFlagState('input_boolean.toggle_notification_mail_delivered');

runWithHA(label, async () => {
    const result = await fn;
    log('info', '', `${label}: ${result}`);
});
