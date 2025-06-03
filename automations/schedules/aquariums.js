import { enforceStateDuringRange } from '../../lib/utils.js';

// Entity IDs for aquarium equipment
const oscarTankPowerheads = 'switch.lr90g_p2';
const turtleLights = 'switch.outlet_turtle_lights';

// Enforce powerheads ON from 12:00 to 20:00
enforceStateDuringRange(12, 20, oscarTankPowerheads);

// Enforce turtle lights ON from 08:00 to 20:00
enforceStateDuringRange(8, 20, turtleLights);
