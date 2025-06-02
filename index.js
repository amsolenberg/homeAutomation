import { connectWebSocket } from './lib/ha-websocket.js';
import { bedroomMotionSetups } from './automations/motion_lights/bedrooms.js';

async function main() {
    try {
        await connectWebSocket();

        [...bedroomMotionSetups].forEach((setup) => setup());
    } catch (e) {
        console.error('Startup error:', e.message || e);
        process.exit(1);
    }
}

main();
