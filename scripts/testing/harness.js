import './bootstrap.js';
import { connectWebSocket } from '../../lib/ha-websocket.js';
import { log } from '../../lib/logger.js';

/**
 * @param {string} testLabel
 * @param {{ (): Promise<void>; (): any; }} fn
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
