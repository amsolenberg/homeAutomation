import dotenv from 'dotenv';
dotenv.config();

export const HA = {
    BASE_URL: process.env.HA_URL,
    TOKEN: process.env.HA_TOKEN
};

export const NTFY = {
    BASE_URL: process.env.NTFY_URL,
    TOKEN: process.env.NTFY_TOKEN
};

export const ENV = {
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};
