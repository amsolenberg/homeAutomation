import { setupMotionLightAutomation } from './light_control.js';

// Configures motion-based light automation for Upstairs Bathroom
function setupUpstairsBathroomMotionLights() {
    setupMotionLightAutomation({
        room: 'Upstairs Bathroom',
        sensor: 'binary_sensor.motion_upstairs_bathroom_occupancy',
        lightEntity: 'light.upstairs_bathroom_lights',
        enabledEntity: 'input_boolean.toggle_motion_upstairs_bathroom'
    });
}

// Configures motion-based light automation for Upstairs Hallway
function setupUpstairsHallwayMotionLights() {
    setupMotionLightAutomation({
        room: 'Upstairs Hallway',
        sensor: 'binary_sensory.motion_upstairs_hallway_occupancy',
        lightEntity: 'light.upstairs_hallway_lights',
        enabledEntity: 'input_boolean.toggle_motion_upstairs_hallway'
    });
}

// Export array of setup functions for batch initialization
export const upstairsMotionSetups = [setupUpstairsBathroomMotionLights, setupUpstairsHallwayMotionLights];
