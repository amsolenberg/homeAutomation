import { runWithHA } from './harness.js';
import { log } from '../../lib/logger.js';
import { getMailDeliveredState } from '../../automations/household/mailbox.js';

const label = 'getMailDeliveredState';
const fn = getMailDeliveredState();

runWithHA(label, async () => {
    const result = await fn;
    log('info', '', `${label}: ${result}`);
});
