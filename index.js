import { connectWebSocket } from './lib/ha-websocket.js';
import { bedroomMotionSetups } from './automations/motion_lights/bedrooms.js';
import { livingRoomMotionSetups } from './automations/motion_lights/downstairs.js';

async function main() {
    try {
        await connectWebSocket();

        [...bedroomMotionSetups].forEach((setup) => setup());
        [...livingRoomMotionSetups].forEach((setup) => setup());
    } catch (e) {
        console.error('Startup error:', e.message || e);
        process.exit(1);
    }
}

main();
