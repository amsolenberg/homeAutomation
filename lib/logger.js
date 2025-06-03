import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ENV } from '../config.js';

const logFormat = winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toLocaleUpperCase()}: ${message}`;
});

const logger = winston.createLogger({
    level: ENV?.LOG_LEVEL || 'info',
    format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
    transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
            dirname: './logs',
            filename: 'automation-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: false,
            maxFiles: '7d'
        })
    ]
});

/**
 *
 * @param {'info' | 'warn' | 'error' | 'debug'} level - Log level
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
