import { NTFY } from '../config.js';

// Validate that necessary ntfy configuration is present
if (!NTFY.BASE_URL || !NTFY.TOKEN) {
    throw new Error('ntfy config is missing or incomplete. Check NTFY_URL and NTFY_TOKEN');
}

// Throttled message queue
const queue = [];
let isProcessing = false;

/**
 * Adds a notification to the queue to be sent via ntfy in order.
 * @param {Object} params
 * @param {string} params.channel - Topic to post to
 * @param {string} params.message - Notification content
 * @param {string} [params.title] - Optional notification title
 * @param {number} [params.priority] - Priority (1-5)
 * @param {string} [params.tags] - Optional tags
 */
export function ntfy(params) {
    queue.push(params);
    // console.log(`[ntfy] Queued → ${params.channel} | Queue size: ${queue.length}`);
    processQueue();
}

async function processQueue() {
    if (isProcessing || queue.length === 0) return;

    isProcessing = true;

    const { channel, message, title = '', priority = 3, tags = '' } = queue.shift();

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 3-second timeout

        const res = await fetch(`${NTFY.BASE_URL}/${channel}`, {
            method: 'POST',
            body: message,
            signal: controller.signal,
            headers: {
                Authorization: `Bearer ${NTFY.TOKEN}`,
                'X-Title': title,
                'X-Priority': priority.toString(),
                'X-Tags': tags
            }
        });

        // console.log(`[ntfy] Sent → ${channel}`);

        clearTimeout(timeout);

        if (!res.ok) {
            console.error(`[ntfy] Failed to send: ${res.status} ${res.statusText}`);
        }
    } catch (e) {
        console.error(`[ntfy] Error: ${e.message || e}`);
    }

    isProcessing = false;

    // Small delay before next message to avoid spamming
    setTimeout(() => processQueue(), 600); // ~1.6 messages/sec
}
