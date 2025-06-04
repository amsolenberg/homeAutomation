import { getAllStates } from '../../lib/ha-rest.js';
import { log } from '../../lib/logger.js';
import { ntfy } from '../../lib/ntfy.js';
import { cronScheduleFn } from '../../lib/utils.js';

/**
 * Checks all battery sensor entities for levels below 10%.
 * Logs any invalid or low values, and sends a notification via NTFY if needed.
 */
async function ntfyLowBattery() {
    const exclude = ['ams', 'tls', 'weebo']; // Filter out these substrings from entity IDs
    const entityList = await getAllStates();

    const batteryEntities = entityList
        .filter((e) => e.entity_id.startsWith('sensor'))
        .filter((e) => e.entity_id.includes('_battery'))
        .filter((e) => !exclude.some((substr) => e.entity_id.includes(substr)));

    const lowBatteryList = [];

    for (const entity of batteryEntities) {
        const batteryPercent = parseFloat(entity.state);
        const name = entity.attributes?.friendly_name || entity.entity_id;

        if (isNaN(batteryPercent)) {
            log('warn', 'Battery Levels', `${name} returned an invalid battery level`);
            continue;
        }

        if (batteryPercent < 10) {
            log('warn', 'Battery Levels', `${entity} battery low: ${batteryPercent}`);
            lowBatteryList.push(`- ${name}: ${batteryPercent}%`);
        }
    }

    if (lowBatteryList.length > 0) {
        ntfy({
            channel: 'haos_server',
            title: 'Battery Levels',
            message: `Low battery levels detected:\n${lowBatteryList.join('\n')}`
        });
    }
}

/**
 * Checks all sensor battery levels daily at 09:00.
 * Notifies about all batteries less than 10%.
 */
export function checkBatteryLevels() {
    cronScheduleFn('0 9 * * *', ntfyLowBattery, 'ntfyLowBatter daily at 0900');
}
