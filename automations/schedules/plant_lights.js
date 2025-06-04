import { enforceStateDuringRanges } from '../../lib/utils.js';

// Entity ID for the dining room plant lights switch
const plantLights = 'switch.outlet_dining_room_plant_lights';

/**
 * Ensures the plant lights are ON during the specified time windows:
 * - 08:00 to 12:00 (morning)
 * - 16:00 to 20:00 (evening)
 *
 * Outside of these windows, the lights will be turned OFF automatically.
 */
enforceStateDuringRanges(
    [
        [8, 12],
        [16, 20]
    ],
    plantLights
);
