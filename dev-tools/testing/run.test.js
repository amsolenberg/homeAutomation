import { run } from './run.js';
import { getAllStates } from '../../lib/ha-rest.js';
import { ntfyLowBattery } from '../../automations/household/battery_levels.js';
import { log } from '../../lib/logger.js';

// await run('getAllStates()', async () => {
//     return await getAllStates();
// });

await run('ntfyLowBattery()', async () => {
    await ntfyLowBattery();
});

// log('alert', 'Test', 'This is an alert log + ntfy');
// log('warn', 'Battery', 'Battery dropped below 15%');
// log('debug', 'Test', { msg: 'This is debug', value: 42 });
