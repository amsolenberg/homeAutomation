import { cronScheduleService } from '../../lib/utils.js';

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
    'input_boolean.toggle_motion_living_room_ca',
    'input_boolean.toggle_motion_dining_room'
];

const bedrooms = [
    'input_boolean.toggle_motion_main_bedroom',
    'input_boolean.toggle_motion_deacons_bedroom',
    'input_boolean.toggle_motion_girls_bedroom',
    'input_boolean.toggle_motion_kaels_bedroom'
];

cronScheduleService(
    '0 5 * * *',
    generalRooms,
    'input_boolean',
    'turn_on',
    'Turn on general rooms motion sensors at 0500'
);

cronScheduleService('0 9 * * *', bedrooms, 'input_boolean', 'turn_on', 'Turn on bedroom motion sensors at 0900');

cronScheduleService('0 21 * * *', bedrooms, 'input_boolean', 'turn_off', 'Turn off bedroom motion sensors at 2100');
