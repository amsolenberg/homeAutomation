import { connectWebSocket } from './lib/ha-websocket.js';
import { bedroomMotionSetups } from './automations/motion_lights/bedrooms.js';
import { downstairsMotionSetups } from './automations/motion_lights/downstairs.js';
import { mainFloorMotionSetups } from './automations/motion_lights/main_floor.js';
import { upstairsMotionSetups } from './automations/motion_lights/upstairs.js';
import './automations/schedulers.js';

async function main() {
    try {
        await connectWebSocket();

        [...bedroomMotionSetups].forEach((setup) => setup());
        [...downstairsMotionSetups].forEach((setup) => setup());
        [...mainFloorMotionSetups].forEach((setup) => setup());
        [...upstairsMotionSetups].forEach((setup) => setup());
    } catch (e) {
        console.error('Startup error:', e.message || e);
        process.exit(1);
    }
}

main();
