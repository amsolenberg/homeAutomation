import { callService, getState } from '../../lib/ha-rest.js';
import { subscribeToStates } from '../../lib/ha-websocket.js';
import { log } from '../../lib/logger.js';

const humiditySensor = 'sensor.multisensor_upstairs_bathroom_humidity';
const exhaustFan = 'fan.upstairs_bathroom_exhaust_fan';

/**
 * Calls Home Assistant's fan service to turn the exhaust fan on or off
 * @param {'turn_on' | 'turn_off'} service
 */
async function handleFan(service) {
    try {
        await callService('fan', service, {
            entity_id: exhaustFan
        });
    } catch (e) {
        log('error', 'Exhaust Fan', `handleFan error:\n${e.message || e}`);
    }
}

/**
 * Monitors bathroom humidity and automatically turns the exhaust fan
 * on at ≥ 65% and off at ≤ 60%.
 */
export async function controlExhaustFan() {
    subscribeToStates(async (entities) => {
        const humidityState = entities[humiditySensor]?.state;
        const humidityLevel = parseFloat(humidityState);
        if (isNaN(humidityLevel)) {
            log('warn', 'Exhaust Fan', `Humidity sensor returned an invalid value: ${humidityState}`);
            return;
        }

        const { state: fanState } = await getState(exhaustFan);
        if (!fanState) {
            log('warn', 'Exhaust Fan', 'Unable to read fan state');
            return;
        }
        const fanStateLower = fanState.toLowerCase();

        try {
            if (humidityLevel >= 65 && fanStateLower === 'off') {
                await handleFan('turn_on');
                log('info', 'Exhaust Fan', `${exhaustFan} turned ON. Humidity: ${humidityLevel}`);
            } else if (humidityLevel <= 60 && fanStateLower === 'on') {
                await handleFan('turn_off');
                log('info', 'Exhaust Fan', `${exhaustFan} turned OFF. Humidity: ${humidityLevel}`);
            }
        } catch (e) {
            log('error', 'Exhaust Fan', `controlExhaustFan error:\n${e.message || e}`);
        }
    });
}
