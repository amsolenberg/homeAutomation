import { NTFY } from '../config.js';
import { log } from './logger.js';

// Validate that necessary ntfy configuration is present
if (!NTFY.BASE_URL || !NTFY.TOKEN) {
    throw new Error('ntfy config is missing or incomplete. Check NTFY_URL and NTFY_TOKEN');
}

/**
 * Sends a notification via ntfy.sh or a self-hosted ntfy server.
 * @param {Object} params
 * @param {string} params.channel - Channel name (topic) to publish to
 * @param {string} params.message - Notification body
 * @param {string} [params.title] - Optional title shown in the notification
 * @param {number} [params.priority] - Priority level (1 = max, 5 = min)
 * @param {string} [params.tags] - Optional tags (e.g., "warning,door")
 */
export async function ntfy({ channel, message, title = '', priority = 3, tags = '' }) {
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
