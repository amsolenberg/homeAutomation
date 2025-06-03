// Import the 'ws' WebSocket library to enable WebSocket support in Node.js
import WebSocket from 'ws';
global.WebSocket = WebSocket;

// Import core Home Assistant WebSocket client utilities
import { createConnection, createLongLivedTokenAuth, subscribeEntities } from 'home-assistant-js-websocket';

// Import project-specific configuration and utilities
import { HA } from '../config.js';
import { log } from './logger.js';
import { handleActionNotifications } from './action_notifications.js';

let connection = null;

/**
 * Establishes a connection to the Home Assistant WebSocket API.
 * Sets up actionable notifications once connected.
 */
export async function connectWebSocket() {
    const auth = createLongLivedTokenAuth(HA.BASE_URL, HA.TOKEN);
    connection = await createConnection({ auth });
    log('info', 'Server', 'Connected to Home Assistant WebSocket API');

    handleActionNotifications(connection);

    return connection;
}

/**
 * Subscribes to all entity state changes and invokes the provided callback.
 * Throws an error if the WebSocket connection is not yet established.
 */
export function subscribeToStates(callback) {
    if (!connection) throw new Error('WebSocket not connected'); // Ensure the connection exists
    return subscribeEntities(connection, callback); // Start subscription
}
