import { NTFY } from '../config.js';
import { log } from './logger.js';

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
            log('error', 'ntfy', `Failed to send: ${res.status} ${res.statusText}`);
        }
    } catch (e) {
        log('error', 'ntfy', `Error:\n${e.message || e}`);
    }
}
