import { enforceStateDuringRange } from '../../lib/utils.js';

const oscarTankPowerheads = 'switch.lr90g_p2';
const turtleLights = 'switch.outlet_turtle_lights';

enforceStateDuringRange(12, 20, oscarTankPowerheads);
enforceStateDuringRange(8, 20, turtleLights);
