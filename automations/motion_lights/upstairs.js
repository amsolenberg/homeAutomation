import { setupMotionLightAutomation } from './light_control.js';

function setupUpstairsBathroomMotionLights() {
    setupMotionLightAutomation({
        room: 'Upstairs Bathroom',
        sensor: 'binary_sensor.motion_upstairs_bathroom_occupancy',
        lightEntity: 'light.upstairs_bathroom_lights',
        enabledEntity: 'input_boolean.toggle_motion_upstairs_bathroom'
    });
}

function setupUpstairsHallwayMotionLights() {
    setupMotionLightAutomation({
        room: 'Upstairs Hallway',
        sensor: 'binary_sensory.motion_upstairs_hallway_occupancy',
        lightEntity: 'light.upstairs_hallway_lights',
        enabledEntity: 'input_boolean.toggle_motion_upstairs_hallway'
    });
}

export const upstairsMotionSetups = [setupUpstairsBathroomMotionLights, setupUpstairsHallwayMotionLights];
