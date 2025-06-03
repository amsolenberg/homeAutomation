import cron from 'node-cron';
import { callService } from '../../lib/ha-rest.js';
import { getTimestamp } from '../../lib/utils.js';

const generalRooms = [
    'input_boolean.toggle_motion_kitchen',
    'input_boolean.toggle_motion_dining_room',
    'input_boolean.toggle_motion_garage',
    'input_boolean.toggle_motion_gameroom',
    'input_boolean.toggle_motion_upstairs_bathroom',
    'input_boolean.toggle_motion_upstairs_hallway',
    'input_boolean.toggle_motion_living_room',
    'input_boolean.toggle_motion_downstairs_bathroom',
    'input_boolean.toggle_motion_laundry_room',
    'input_boolean.toggle_motion_living_room_ta',
    'input_boolean.toggle_motion_living_room_ca',
    'input_boolean.toggle_motion_dining_room'
];

const bedrooms = [
    'input_boolean.toggle_motion_main_bedroom',
    'input_boolean.toggle_motion_deacons_bedroom',
    'input_boolean.toggle_motion_girls_bedroom',
    'input_boolean.toggle_motion_kaels_bedroom'
];

function toggleMotionSensors(cronSchedule, roomArray, service, label = 'unnamed task') {
    console.log(`${getTimestamp()} [Scheduler] Scheduled - ${label}`);
    cron.schedule(cronSchedule, async () => {
        try {
            await callService('switch', service, {
                entity_id: roomArray
            });
            console.log(`${getTimestamp()} [Scheduler] '${label}' ran successfully.`);
        } catch (e) {
            console.error(`${getTimestamp()} [Scheduler] '${label}' failed:`, e.message || e);
        }
    });
}

toggleMotionSensors('0 5 * * *', generalRooms, 'turn_on', 'Turn on general room motion sensors at 0500');

toggleMotionSensors('0 9 * * *', bedrooms, 'turn_on', 'Turn on bedroom motion sensors at 0900');

toggleMotionSensors('0 21 * * *', bedrooms, 'turn_off', 'Turn off bedroom motion sensors at 2100');
