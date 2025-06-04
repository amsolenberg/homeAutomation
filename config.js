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
    TOKEN: process.env.NTFY_TOKEN,
    ERROR_TOPIC: process.env.NTFY_ERROR_TOPIC,
    WARN_TOPIC: process.env.NTFY_WARN_TOPIC,
    ALERT_TOPIC: process.env.NTFY_ALERT_TOPIC,
    NOTIFY_TOPIC: process.env.NTFY_NOTIFY_TOPIC,
    INFO_TOPIC: process.env.NTFY_INFO_TOPIC,
    DEBUG_TOPIC: process.env.NTFY_DEBUG_TOPIC,
    PTFD_TOPIC: process.env.NTFY_PTFD_TOPIC
};

// General environment-level settings
export const ENV = {
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};
