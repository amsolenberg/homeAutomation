import { callService } from '../../lib/ha-rest.js';
import { subscribeToStates } from '../../lib/ha-websocket.js';
import { log } from '../../lib/logger.js';

// List of switches that should always remain on
const switches = ['switch.driveway_switch', 'switch.deacons_bedroom_switch', 'switch.master_bedroom_switch'];

/**
 * Calls Home Assistant to turn a switch on.
 * @param {string} entity - The entity_id of the switch
 */
async function switchOn(entity) {
    try {
        await callService('switch', 'turn_on', {
            entity_id: entity
        });
    } catch (e) {
        log('error', 'Always On Switches', `switchOn error:\n${e.message || e}`);
    }
}

/**
 * Subscribes to entity state updates and ensures all defined switches
 * are turned on at all times (unless they are unavailable or unknown).
 */
export async function alwaysOnSwitches() {
    subscribeToStates(async (entities) => {
        for (const entity of switches) {
            log('info', 'Always On Switches', `Monitoring switch: ${entity}`);

            const currentState = entities[entity]?.state;
            if (!currentState) {
                log('warn', 'Always On Switches', `${entity} has no state`);
                continue;
            }

            if (['unavailable', 'unknown'].includes(currentState)) {
                log('warn', 'Always On Switches', `${entity} state is ${currentState}, skipping.`);
                continue;
            }

            if (currentState === 'off') {
                await switchOn(entity);
                log('info', 'Always On Switches', `${entity} was OFF, turning on.`);
            }
        }
    });
}
