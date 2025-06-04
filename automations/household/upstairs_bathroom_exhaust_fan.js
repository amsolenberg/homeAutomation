import { callService, getState } from '../../lib/ha-rest';
import { log } from '../../lib/logger';

const humiditySensor = 'sensor.multisensor_upstairs_bathroom_humidity';
const exhaustFan = 'fan.upstairs_bathroom_exhaust_fan';
