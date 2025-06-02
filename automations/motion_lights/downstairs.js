import { setupMotionLightAutomation } from './light_control.js';

function setupLivingRoomCAMotionLights() {
    setupMotionLightAutomation({
        room: 'Living Room (Computer Area)',
        sensor: 'binary_sensor.presence_sensor_fp2_feed_presence_sensor_2',
        lightEntity: ['light.bulb_living_room_lamp_south', 'light.bulb_living_room_lamp_west'],
        offDelayMinutes: 1
        // log: true
    });
}

function setupLivingRoomTAMotionLights() {
    setupMotionLightAutomation({
        room: 'Living Room (TV Area)',
        sensor: 'binary_sensor.presence_sensor_fp2_feed_presence_sensor_3',
        lightEntity: ['light.bulb_living_room_lamp_east', 'light.living_room_lights'],
        offDelayMinutes: 1
        // log: true
    });
}

function setupDownstairsBathroomMotionLights() {
    setupMotionLightAutomation({
        room: 'Downstairs Bathroom',
        sensor: 'binary_sensor.motion_downstairs_bathroom_occupancy',
        lightEntity: 'light.downstairs_bathroom_lights'
    });
}

function setupLaundryRoomMotionLights() {
    setupMotionLightAutomation({
        room: 'Laundry Room',
        sensor: 'binary_sensor.motion_laundry_room_occupancy',
        lightEntity: 'light.laundry_room_lights'
    });
}

export const livingRoomMotionSetups = [
    setupLivingRoomCAMotionLights,
    setupLivingRoomTAMotionLights,
    setupDownstairsBathroomMotionLights,
    setupLaundryRoomMotionLights
];
