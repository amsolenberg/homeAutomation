import { callService } from './ha-rest.js';
import { subscribeEvents } from 'home-assistant-js-websocket/dist/messages.js';
import { log } from './logger.js';

const actionHandlers = new Map();

// Send a notification with optional actions
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

export function onAction(actionType, handlerFn) {
    if (!actionType || typeof handlerFn !== 'function') return;
    actionHandlers.set(actionType, handlerFn);
}

// Hook into HA WebSocket and listen for `mobile_app_notification_action`
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
