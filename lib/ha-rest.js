// Axios is used to perform HTTP requests to Home Assistant's REST API
import axios from 'axios';
import { HA } from '../config.js';

// Ensure the necessary configuration is present before making API calls
if (!HA?.BASE_URL || !HA?.TOKEN) {
    throw new Error('Home Assistant config is missing or incomplete. Check HA_BASE_URL and HA_TOKEN.');
}

// Normalize the base URL and prepare request headers with authentication
const baseURL = HA.BASE_URL.endsWith('/') ? HA.BASE_URL.slice(0, -1) : HA.BASE_URL;
const headers = {
    Authorization: `Bearer ${HA.TOKEN}`,
    'Content-Type': 'application/json'
};

/**
 * Fetches the state of all entities from Home Assistant.
 */
export async function getAllStates() {
    const res = await axios.get(`${baseURL}/api/states`, { headers });
    return res.data;
}

/**
 * Fetches the state of a single entity.
 * @param {string} entityId - The entity_id to query (e.g., "light.kitchen").
 */
export async function getState(entityId) {
    const res = await axios.get(`${baseURL}/api/states/${entityId}`, { headers });
    return res.data;
}

/**
 * Calls a Home Assistant service.
 * @param {string} domain - The service domain (e.g., "light").
 * @param {string} service - The specific service (e.g., "turn_on").
 * @param {object} data - Payload for the service call.
 */
export async function callService(domain, service, data = {}) {
    const res = await axios.post(`${baseURL}/api/services/${domain}/${service}`, data, { headers });
    return res.data;
}
