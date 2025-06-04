import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ENV } from '../config.js';
import { NTFY } from '../config.js';
import { ntfy } from './ntfy.js';

// Ensure logging level is defined in config
if (!ENV.LOG_LEVEL) {
    throw new Error('Log level is not missing or incomplete. Check LOG_LEVEL.');
}

const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        alert: 2,
        notify: 3,
        info: 4,
        debug: 5
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        alert: 'magenta',
        notify: 'cyan',
        info: 'green',
        debug: 'blue'
    }
};

// Define custom colors for console output
winston.addColors(customLevels.colors);

// Console log format: timestamp + colored, uppercase log level
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...rest }) => {
        // Remove ANSI codes
        const rawLevel = level.replace(/\u001b\[[0-9;]*m/g, '').toLowerCase();
        // Colorize manually
        const coloredLevel = winston.format.colorize().colorize(rawLevel, rawLevel.toUpperCase());
        // Include meta object as pretty JSON if it exists
        const meta = rest.meta ? `\n${JSON.stringify(rest.meta, null, 2)}` : '';

        return `[${timestamp}] ${coloredLevel}: ${message}${meta}`;
    })
);

// File log format: timestamp + plain uppercase level
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...rest }) => {
        const meta = rest.meta ? `\n${JSON.stringify(rest.meta, null, 2)}` : '';
        return `[${timestamp}] ${level.toUpperCase()}: ${message}${meta}`;
    })
);

// Create logger instance with console and rotating file transports
const logger = winston.createLogger({
    levels: customLevels.levels,
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
 * Logs a message with optional level and title/context.
 * Also sends a notification via ntfy if a matching NTFY_<LEVEL>_TOPIC is defined in config.
 *
 * @param {'error' | 'warn' | 'alert' | 'notify' | 'info' | 'debug'} level - Severity level
 * @param {string} title - Optional context label (e.g., 'Battery Monitor', 'Server')
 * @param {string | object} message - Main log message or object (will be stringified)
 */
export function log(level = 'info', title = '', message = '') {
    const prefix = title ? `[${title}] ` : '';

    const finalMessage = typeof message === 'object' ? JSON.stringify(message, null, 2) : `${prefix}${message}`;

    logger.log({
        level,
        message: typeof message === 'object' ? prefix : finalMessage,
        meta: typeof message === 'object' ? message : undefined
    });

    const ntfyEnvVar = `${level.toUpperCase()}_TOPIC`;
    const ntfyChannel = NTFY?.[ntfyEnvVar];

    if (ntfyChannel) {
        ntfy({
            channel: ntfyChannel,
            title: title || `Log: ${level.toUpperCase()}`,
            message: finalMessage
        });
    }
}
