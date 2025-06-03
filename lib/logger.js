import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ENV } from '../config.js';

// Ensure logging level is defined in config
if (!ENV.LOG_LEVEL) {
    throw new Error('Log level is not missing or incomplete. Check LOG_LEVEL.');
}

// Define custom colors for console output
winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue'
});

// Console log format: timestamp + colored, uppercase log level
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

// File log format: timestamp + plain uppercase level
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
);

// Create logger instance with console and rotating file transports
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
 * Logs a message with optional level and title/context.
 * @param {'error' | 'warn' | 'info' | 'debug'} level - Severity level
 * @param {string} title - Optional context label (e.g., 'AC', 'Scheduler')
 * @param {string} message - Main log message
 */
export function log(level = 'info', title = '', message = '') {
    const prefix = title ? `[${title}] ` : '';
    logger.log({
        level,
        message: `${prefix}${message}`
    });
}
