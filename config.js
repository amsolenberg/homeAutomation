// Load environment variables from a .env file into process.env
import dotenv from 'dotenv';
dotenv.config();

// Home Assistant connection settings
export const HA = {
    BASE_URL: process.env.HA_URL,
    TOKEN: process.env.HA_TOKEN
};

// ntfy notification server settings
export const NTFY = {
    BASE_URL: process.env.NTFY_URL,
    TOKEN: process.env.NTFY_TOKEN
};

// General environment-level settings
export const ENV = {
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};
