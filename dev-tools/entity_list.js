/**
 * CLI tool to search/filter Home Assistant entity_ids using WebSocket state subscription
 * Run from project root: `node dev-tools/entity_list.js`
 */

import readline from 'readline';
import { connectWebSocket } from '../lib/ha-websocket.js';
import { subscribeEntities } from 'home-assistant-js-websocket';

// Set up readline interface for CLI input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Global state
let currentEntities = {}; // Stores live entity states from HA
let query = ''; // Current user search/filter string
let page = 0; // Current page of results
const pageSize = 25; // Number of results per page

/**
 * Renders filtered entity_id results to the console
 */
function renderResults() {
    const matches = Object.keys(currentEntities)
        .filter((id) => id.toLowerCase().includes(query)) // Filter by search term
        .sort();

    const totalPages = Math.ceil(matches.length / pageSize);
    const start = page * pageSize;
    const end = start + pageSize;

    console.clear();
    console.log(`🔎 Results for: "${query}" (Page ${page + 1}/${totalPages || 1})\n`);

    matches.slice(start, end).forEach((id) => {
        console.log(`• ${id} (${currentEntities[id]?.state})`);
    });

    if (matches.length === 0) {
        console.log('No matches found.');
    }

    console.log('\n[Type to search | Enter = update | n = next | p = previous | Ctrl+C to exit]');
}

/**
 * Initializes the entity search CLI and Home Assistant connection
 */
async function startEntityLister() {
    try {
        console.log('Connecting to Home Assistant...');
        const conn = await connectWebSocket();

        // Subscribe to all entity state updates
        subscribeEntities(conn, (entities) => {
            currentEntities = entities;
            console.log('[Type to search | Enter = update | n = next | p = previous | Ctrl+C to exit]');
        });

        // Handle user input
        rl.on('line', (input) => {
            const cmd = input.trim().toLowerCase();

            if (cmd === 'n') {
                page++;
                renderResults();
            } else if (cmd === 'p') {
                page = Math.max(0, page - 1);
                renderResults();
            } else {
                query = cmd;
                page = 0;
                renderResults();
            }
        });
    } catch (e) {
        console.error('❌ Failed to connect to Home Assistant:\n', e.message || e);
        process.exit(1);
    }
}

startEntityLister();
