import { setupMotionLightAutomation } from './light_control.js';

function setupMainBedroomMotionLights() {
    setupMotionLightAutomation({
        room: 'Main Bedroom',
        sensor: 'binary_sensor.motion_main_bedroom_occupancy',
        lightEntity: 'light.group_light_main_bedroom_lights'
        // log: true
    });
}

function setupDeaconsBedroomMotionLights() {
    setupMotionLightAutomation({
        room: 'Deacons Bedroom',
        sensor: 'binary_sensor.motion_deacons_bedroom_occupancy',
        lightEntity: 'light.bulb_deacons_bedroom_light',
        log: false
    });
}

function setupGirlsBedroomMotionLights() {
    setupMotionLightAutomation({
        room: 'Girls Bedroom',
        sensor: 'binary_sensor.motion_girls_bedroom_occupancy',
        lightEntity: 'light.girls_bedroom_lights'
    });
}

function setupKaelsBedroomMotionLights() {
    setupMotionLightAutomation({
        room: 'Kael Bedroom',
        sensor: 'binary_sensor.motion_kaels_bedroom_occupancy',
        lightEntity: 'light.kaels_bedroom_lights'
    });
}

export const bedroomMotionSetups = [
    setupMainBedroomMotionLights,
    setupDeaconsBedroomMotionLights,
    setupGirlsBedroomMotionLights,
    setupKaelsBedroomMotionLights
];
