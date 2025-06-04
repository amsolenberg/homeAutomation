import { getAllStates } from '../../lib/ha-rest.js';

async function testFn() {
    const exclude = ['ams', 'tls', 'weebo'];
    const result = await getAllStates();
    const entity_id = result
        .filter((e) => e.entity_id.startsWith('sensor'))
        .filter((e) => e.entity_id.includes('_battery'))
        .filter((e) => !exclude.some((substr) => e.entity_id.includes(substr)))
        .map((e) => e.entity_id);
    // log('info', label, entity_id);
    console.log(entity_id[0]);
    // console.dir(result, { depth: null });
}

testFn();
