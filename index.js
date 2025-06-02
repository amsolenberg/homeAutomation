import { connectWebSocket } from './lib/ha-websocket.js';
import { setupMainBedroomMotionAutomation } from './automations/motion_lights/main_bedroom.js';

async function main() {
    try {
        await connectWebSocket();

        setupMainBedroomMotionAutomation();
    } catch (e) {
        console.error('Startup error:', e.message || e);
        process.exit(1);
    }
}

main();
