import { NTFY } from '../config.js';
import { getTimestamp } from './utils.js';

export async function ntfy(channel, message, title = '', priority = 3, tags = '') {
    try {
        const res = await fetch(`${NTFY.BASE_URL}/${channel}`, {
            method: 'POST',
            body: message,
            headers: {
                Authorization: `Bearer ${NTFY.TOKEN}`,
                'X-Title': title,
                'X-Priority': priority.toString(),
                'X-Tags': tags
            }
        });

        if (!res.ok) {
            console.error(`${getTimestamp()} [ntfy] Failed to send: ${res.status} ${res.statusText}`);
        }
    } catch (e) {
        console.error(`${getTimestamp()} [ntfy] Error:`, e.message || e);
    }
}
