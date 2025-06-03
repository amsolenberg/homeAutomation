import { connectWebSocket } from './lib/ha-websocket.js';
import { log } from './lib/logger.js';

// Household
import {
    acTonightReset,
    acRunScheduler,
    acTonightNotification
} from './automations/household/main_bedroom_portable_ac.js';

// Motion Lights
import { bedroomMotionSetups } from './automations/motion_lights/bedrooms.js';
import { downstairsMotionSetups } from './automations/motion_lights/downstairs.js';
import { mainFloorMotionSetups } from './automations/motion_lights/main_floor.js';
import { upstairsMotionSetups } from './automations/motion_lights/upstairs.js';
import { mailStatusReset, monitorMailbox } from './automations/household/mailbox.js';

async function main() {
    try {
        await connectWebSocket();

        // Household
        acTonightReset();
        acTonightNotification();
        acRunScheduler();
        mailStatusReset();
        monitorMailbox();

        // Motion Lights
        [...bedroomMotionSetups].forEach((setup) => setup());
        [...downstairsMotionSetups].forEach((setup) => setup());
        [...mainFloorMotionSetups].forEach((setup) => setup());
        [...upstairsMotionSetups].forEach((setup) => setup());

        // Schedules
        await import('./automations/schedules/motion_sensors.js');
        await import('./automations/schedules/aquariums.js');
    } catch (e) {
        log('error', 'Server', `Startup error:\n${e.message || e}`);
        process.exit(1);
    }
}

main();
