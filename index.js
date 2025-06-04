import { connectWebSocket } from './lib/ha-websocket.js';
import { log } from './lib/logger.js';

// Household automations
import {
    acTonightReset,
    acRunScheduler,
    acTonightNotification
} from './automations/household/main_bedroom_portable_ac.js';
import { mailStatusReset, monitorMailbox } from './automations/household/mailbox.js';
import { monitorDoorLock } from './automations/household/front_door.js';
import { controlExhaustFan } from './automations/household/upstairs_bathroom_exhaust_fan.js';
import { alwaysOnSwitches } from './automations/household/always_on_switches.js';
import { checkBatteryLevels } from './automations/household/battery_levels.js';

// Motion lighting automations by area
import { bedroomMotionSetups } from './automations/motion_lights/bedrooms.js';
import { downstairsMotionSetups } from './automations/motion_lights/downstairs.js';
import { mainFloorMotionSetups } from './automations/motion_lights/main_floor.js';
import { upstairsMotionSetups } from './automations/motion_lights/upstairs.js';

/**
 * Entry point for automation runtime.
 * - Establishes WebSocket connection to Home Assistant
 * - Initializes automations
 * - Dynamically loads scheduled tasks
 */
async function main() {
    try {
        await connectWebSocket();

        // Initialize household automations
        acTonightReset();
        acTonightNotification();
        acRunScheduler();
        alwaysOnSwitches();
        checkBatteryLevels();
        controlExhaustFan;
        monitorDoorLock();
        mailStatusReset();
        monitorMailbox();

        // Initialize motion-triggered lighting by area
        [...bedroomMotionSetups].forEach((setup) => setup());
        [...downstairsMotionSetups].forEach((setup) => setup());
        [...mainFloorMotionSetups].forEach((setup) => setup());
        [...upstairsMotionSetups].forEach((setup) => setup());

        // Load time-based automation schedules
        await import('./automations/schedules/motion_sensors.js');
        await import('./automations/schedules/aquariums.js');
        await import('./automations/schedules/plant_lights.js');
    } catch (e) {
        log('error', 'Server', `Startup error:\n${e.message || e}`);
        process.exit(1);
    }
}

main();
