import { cronScheduleService } from '../../lib/utils.js';

// Input booleans that control motion automations for general-use rooms
const generalRooms = [
    'input_boolean.toggle_motion_kitchen',
    'input_boolean.toggle_motion_dining_room',
    'input_boolean.toggle_motion_garage',
    'input_boolean.toggle_motion_office',
    'input_boolean.toggle_motion_upstairs_bathroom',
    'input_boolean.toggle_motion_upstairs_hallway',
    'input_boolean.toggle_motion_living_room',
    'input_boolean.toggle_motion_downstairs_bathroom',
    'input_boolean.toggle_motion_laundry_room',
    'input_boolean.toggle_motion_living_room_ta',
    'input_boolean.toggle_motion_living_room_ca'
];

// Input booleans for bedrooms
const bedrooms = [
    'input_boolean.toggle_motion_main_bedroom',
    'input_boolean.toggle_motion_deacons_bedroom',
    'input_boolean.toggle_motion_girls_bedroom',
    'input_boolean.toggle_motion_kaels_bedroom'
];

// Turn on general room motion sensors every day at 05:00
cronScheduleService(
    '0 5 * * *',
    generalRooms,
    'input_boolean',
    'turn_on',
    'Turn on general rooms motion sensors at 0500'
);

// Turn on bedroom motion sensors at 09:00
cronScheduleService('0 9 * * *', bedrooms, 'input_boolean', 'turn_on', 'Turn on bedroom motion sensors at 0900');

// Turn off bedroom motion sensors at 21:00
cronScheduleService('0 21 * * *', bedrooms, 'input_boolean', 'turn_off', 'Turn off bedroom motion sensors at 2100');
