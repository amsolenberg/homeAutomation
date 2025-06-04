import { setupMotionLightAutomation } from './light_control.js';

// Configures motion-based light automation for Kitchen
function setupKitchenMotionLights() {
    setupMotionLightAutomation({
        room: 'Kitchen',
        sensor: 'binary_sensor.motion_kitchen_occupancy',
        lightEntity: ['light.kitchen_lights', 'light.outlet_kitchen_under_cabinet_lighting'],
        enabledEntity: 'input_boolean.toggle_motion_kitchen'
    });
}

// Configures motion-based light automation for Dining Room
function setupDiningRoomMotionLights() {
    setupMotionLightAutomation({
        room: 'Dining Room',
        sensor: 'binary_sensor.dining_room_fp2_presence_sensory_dining_area',
        lightEntity: 'light.dining_room_lights',
        enabledEntity: 'input_boolean.toggle_motion_dining_room'
    });
}

// Configures motion-based light automation for Garage
function setupGarageMotionLights() {
    setupMotionLightAutomation({
        room: 'Garage',
        sensor: 'binary_sensor.motion_garage_occupancy',
        lightEntity: 'light.group_light_garage_lights',
        enabledEntity: 'input_boolean.toggle_motion_garage'
    });
}

// Configures motion-based light automation for Office
function setupOfficeMotionLights() {
    setupMotionLightAutomation({
        room: 'Office',
        sensor: 'binary_sensor.motion_gameroom_occupancy',
        lightEntity: 'light.gameroom_lights',
        enabledEntity: 'input_boolean.toggle_motion_office'
    });
}

// Export array of setup functions for batch initialization
export const mainFloorMotionSetups = [
    setupKitchenMotionLights,
    setupDiningRoomMotionLights,
    setupGarageMotionLights,
    setupOfficeMotionLights
];
