// dev-tools/batteryTest.js
import { ntfyLowBattery } from '../../automations/household/battery_levels.js';

ntfyLowBattery()
    .then(() => {
        console.log('\nDone.');
    })
    .catch((err) => {
        console.error('Error running ntfyLowBattery:', err);
    });
