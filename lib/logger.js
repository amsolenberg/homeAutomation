import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ENV } from '../config.js';

if (!ENV.LOG_LEVEL) {
    throw new Error('Log level is not missing or incomplete. Check LOG_LEVEL.');
}

winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue'
});

// Formatter for console: colored + uppercase level
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
        // Remove ANSI codes
        const rawLevel = level.replace(/\u001b\[[0-9;]*m/g, '').toLowerCase();
        // Colorize manually
        const coloredLevel = winston.format.colorize().colorize(rawLevel, rawLevel.toUpperCase());
        return `[${timestamp}] ${coloredLevel}: ${message}`;
    })
);

// Formatter for file: plain text + uppercase level
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
);

const logger = winston.createLogger({
    level: ENV?.LOG_LEVEL || 'info',
    transports: [
        new winston.transports.Console({
            format: consoleFormat
        }),
        new DailyRotateFile({
            dirname: './logs',
            filename: 'automation-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: false,
            maxFiles: '7d',
            format: fileFormat
        })
    ]
});

/**
 *
 * @param {'error' | 'warn' | 'info' | 'debug'} level - Log level
 * @default 'info'
 * @param {string} title - Log context (e.g., 'Scheduler', 'AC')
 * @param {string} message - Log message
 */
export function log(level = 'info', title = '', message = '') {
    const prefix = title ? `[${title}] ` : '';
    logger.log({
        level,
        message: `${prefix}${message}`
    });
}
