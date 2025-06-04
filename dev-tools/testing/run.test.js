import { run } from './run.js';
import { getAllStates } from '../../lib/ha-rest.js';
import { ntfyLowBattery } from '../../automations/household/battery_levels.js';

// await run('getAllStates()', async () => {
//     return await getAllStates();
// });

// await run('ntfyLowBattery()', async () => {
//     await ntfyLowBattery();
// });
