import axios from 'axios';
import { HA } from '../config.js';

if (!HA?.BASE_URL || !HA?.TOKEN) {
    throw new Error('Home Assistant config is missing or incomplete. Check HA_BASE_URL and HA_TOKEN.');
}

const baseURL = HA.BASE_URL.endsWith('/') ? HA.BASE_URL.slice(0, -1) : HA.BASE_URL;
const headers = {
    Authorization: `Bearer ${HA.TOKEN}`,
    'Content-Type': 'application/json'
};

export async function getAllStates() {
    const res = await axios.get(`${baseURL}/api/states`, { headers });
    return res.data;
}

export async function getState(entityId) {
    const res = await axios.get(`${baseURL}/api/states/${entityId}`, { headers });
    return res.data;
}

export async function callService(domain, service, data = {}) {
    const res = await axios.post(`${baseURL}/api/services/${domain}/${service}`, data, { headers });
    return res.data;
}
