import WebSocket from 'ws';
global.WebSocket = WebSocket;
import {
    createConnection,
    createLongLivedTokenAuth,
    subscribeEntities,
    callService
} from 'home-assistant-js-websocket';

import { subscribeEvents } from 'home-assistant-js-websocket/dist/messages.js';

import { HA } from '../config.js';
import { log } from './logger.js';
import { handleActionNotifications } from './action_notifications.js';

let connection = null;

export async function connectWebSocket() {
    const auth = createLongLivedTokenAuth(HA.BASE_URL, HA.TOKEN);
    connection = await createConnection({ auth });
    log('info', 'Server', 'Connected to Home Assistant WebSocket API');

    handleActionNotifications(connection);

    return connection;
}

export function subscribeToStates(callback) {
    if (!connection) throw new Error('WebSocket not connected');
    return subscribeEntities(connection, callback);
}
