import './bootstrap.js';
import { connectWebSocket } from '../../lib/ha-websocket.js';
import { log } from '../../lib/logger.js';

/**
 * Executes a test or script block with a Home Assistant WebSocket connection.
 * Useful for isolated automation testing or dev scripts.
 *
 * @param {string} testLabel - Name or description of the test
 * @param {Function} fn - Async function to run after connecting to HA
 */
export async function runWithHA(testLabel, fn) {
    try {
        await connectWebSocket();
        log('info', `${testLabel}`, 'Running');
        log('info', '', '--------------------------------------');

        await fn();

        log('info', '', '--------------------------------------');
        log('info', `${testLabel}`, 'Complete');
        process.exit(0);
    } catch (e) {
        log('error', 'Test Harness', `${testLabel} error:\n${e.message || e}`);
        process.exit(1);
    }
}
