import { setupMotionLightAutomation } from './light_control.js';

// Configures motion-based light automation for Main Bedroom
function setupMainBedroomMotionLights() {
    setupMotionLightAutomation({
        room: 'Main Bedroom',
        sensor: 'binary_sensor.motion_main_bedroom_occupancy',
        lightEntity: 'light.group_light_main_bedroom_lights',
        enabledEntity: 'input_boolean.toggle_motion_main_bedroom'
    });
}

// Configures motion-based light automation for Deacon’s Bedroom
function setupDeaconsBedroomMotionLights() {
    setupMotionLightAutomation({
        room: 'Deacons Bedroom',
        sensor: 'binary_sensor.motion_deacons_bedroom_occupancy',
        lightEntity: 'light.bulb_deacons_bedroom_light',
        enabledEntity: 'input_boolean.toggle_motion_deacons_bedroom'
    });
}

// Configures motion-based light automation for Girls’ Bedroom
function setupGirlsBedroomMotionLights() {
    setupMotionLightAutomation({
        room: 'Girls Bedroom',
        sensor: 'binary_sensor.motion_girls_bedroom_occupancy',
        lightEntity: 'light.girls_bedroom_lights',
        enabledEntity: 'input_boolean.toggle_motion_girls_bedroom'
    });
}

// Configures motion-based light automation for Kael’s Bedroom
function setupKaelsBedroomMotionLights() {
    setupMotionLightAutomation({
        room: 'Kael Bedroom',
        sensor: 'binary_sensor.motion_kaels_bedroom_occupancy',
        lightEntity: 'light.kaels_bedroom_lights',
        enabledEntity: 'input_boolean.toggle_motion_kaels_bedroom'
    });
}

// Export array of setup functions for batch initialization
export const bedroomMotionSetups = [
    setupMainBedroomMotionLights,
    setupDeaconsBedroomMotionLights,
    setupGirlsBedroomMotionLights,
    setupKaelsBedroomMotionLights
];
