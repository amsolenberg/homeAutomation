import { callService } from './ha-rest.js';
import { subscribeEvents } from 'home-assistant-js-websocket/dist/messages.js';
import { log } from './logger.js';

// Map to store handlers for actionable notification responses
const actionHandlers = new Map();

/**
 * Sends a mobile notification with optional action buttons.
 * @param {Object} params
 * @param {string} params.device - notify service target (e.g., "mobile_app_pixel_7")
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification body
 * @param {Array} params.actionsArray - List of action buttons
 * @param {boolean} params.persistent - Whether the notification should persist
 * @param {string} params.tag - Unique tag to avoid duplicates
 */
export async function sendActionNotification({ device, title, message, actionsArray, persistent, tag }) {
    if (!device) throw new Error('Missing device ID for sendActionNotification');
    await callService('notify', device, {
        title: title,
        message: message,
        data: {
            actions: actionsArray,
            persistent: persistent,
            tag: tag
        }
    });
}

/**
 * Registers a handler function to run when a specific action is triggered.
 * @param {string} actionType - Action name from the notification
 * @param {Function} handlerFn - Function to call when action is received
 */
export function onAction(actionType, handlerFn) {
    if (!actionType || typeof handlerFn !== 'function') return;
    actionHandlers.set(actionType, handlerFn);
}

/**
 * Listens for `mobile_app_notification_action` events from Home Assistant
 * and dispatches them to the registered handler (if any).
 */
export function handleActionNotifications(connection) {
    connection.sendMessage(subscribeEvents('mobile_app_notification_action'));
    log('info', 'Server', 'Subscribed to `mobile_app_notification_action`');

    connection.socket.addEventListener('message', async (event) => {
        const data = JSON.parse(event.data);

        if (data?.type === 'event' && data?.event_type === 'mobile_app_notification_action') {
            const action = data.event?.data?.action;
            const handler = actionHandlers.get(action);
            if (handler) {
                await handler(data.event?.data);
            }
        }
    });
}
