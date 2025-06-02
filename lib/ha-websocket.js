import {
    createConnection,
    createLongLivedTokenAuth,
    subscribeEntities,
    callService
} from 'home-assistant-js-websocket';

import { HA } from '../config.js';

let connection = null;

export async function connectWebSocket() {
    const auth = createLongLivedTokenAuth(HA.BASE_URL, HA.TOKEN);
    connection = await createConnection({ auth });
    console.log('Connected to Home Assistant WebSocket API');
    return connection;
}

export function subscribeToStates(callback) {
    if (!connection) throw new Error('WebSocket not connected');
    return subscribeEntities(connection, callback);
}

export function callHAService(domain, service, data = {}, target = {}) {
    if (!connection) throw new Error('WebSocket not connected');
    return callService(connection, domain, service, data, target);
}
