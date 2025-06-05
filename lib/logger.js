import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ENV } from '../config.js';
import { NTFY } from '../config.js';
import { ntfy } from './ntfy.js';

// ─────────────────────────────────────────────────────────────
// Logger startup state for batched notifications
// ─────────────────────────────────────────────────────────────

const startupTime = Date.now();
const STARTUP_BATCH_WINDOW = 10000; // 10 seconds after startup
const startupBuffer = [];
let startupFlushScheduled = false;

// ─────────────────────────────────────────────────────────────
// Custom log levels and colors
// ─────────────────────────────────────────────────────────────

const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        alert: 2,
        notify: 3,
        ptfd: 4,
        info: 5,
        debug: 6
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        alert: 'magenta',
        notify: 'cyan',
        ptfd: 'orange',
        info: 'green',
        debug: 'blue'
    }
};

winston.addColors(customLevels.colors);

// ─────────────────────────────────────────────────────────────
// Console and file log formats
// ─────────────────────────────────────────────────────────────

const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...rest }) => {
        const rawLevel = level.replace(/\u001b\[[0-9;]*m/g, '').toLowerCase();
        const coloredLevel = winston.format.colorize().colorize(rawLevel, rawLevel.toUpperCase());
        const meta = rest.meta ? `\n${JSON.stringify(rest.meta, null, 2)}` : '';
        return `[${timestamp}] ${coloredLevel}: ${message}${meta}`;
    })
);

const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...rest }) => {
        const meta = rest.meta ? `\n${JSON.stringify(rest.meta, null, 2)}` : '';
        return `[${timestamp}] ${level.toUpperCase()}: ${message}${meta}`;
    })
);

// ─────────────────────────────────────────────────────────────
// Winston logger instance
// ─────────────────────────────────────────────────────────────

if (!ENV.LOG_LEVEL) {
    throw new Error('Log level is not defined. Check LOG_LEVEL.');
}

const logger = winston.createLogger({
    levels: customLevels.levels,
    level: ENV.LOG_LEVEL || 'info',
    transports: [
        new winston.transports.Console({ format: consoleFormat }),
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

// ─────────────────────────────────────────────────────────────
// Main logging function
// ─────────────────────────────────────────────────────────────

/**
 * Logs a message with optional level and title/context.
 * Sends a notification via ntfy if a matching NTFY_<LEVEL>_TOPIC is configured.
 *
 * @param {'error' | 'warn' | 'alert' | 'notify' | 'ptfd' | 'info' | 'debug'} level
 * @param {string} title - Optional context (e.g., 'Battery Monitor', 'Scheduler')
 * @param {string | object} message - Log message or object (object will be stringified)
 */
export function log(level = 'info', title = '', message = '') {
    const prefix = title ? `[${title}] ` : '';
    const finalMessage = typeof message === 'object' ? JSON.stringify(message, null, 2) : `${prefix}${message}`;

    // Log to console + file
    logger.log({
        level,
        message: typeof message === 'object' ? prefix : finalMessage,
        meta: typeof message === 'object' ? message : undefined
    });

    // Don't notify for debug-level logs
    if (level === 'debug') return;

    // Look up topic for this log level
    const ntfyEnvVar = `${level.toUpperCase()}_TOPIC`;
    const ntfyChannel = NTFY?.[ntfyEnvVar];

    // Validate the topic
    if (!ntfyChannel || typeof ntfyChannel !== 'string' || ntfyChannel.trim() === '' || ntfyChannel === 'undefined') {
        console.log(`[guard] Skipped ntfy() — level: ${level}, topic: "${ntfyChannel}"`);
        return;
    }

    // Batch notifications during startup window
    const now = Date.now();
    const inStartupWindow = now - startupTime < STARTUP_BATCH_WINDOW;

    if (inStartupWindow) {
        const formatted = `${title ? `[${title}] ` : ''}${finalMessage}`;
        startupBuffer.push(formatted);

        if (!startupFlushScheduled) {
            startupFlushScheduled = true;

            setTimeout(() => {
                const batchedMsg = `[Startup Summary]\n${startupBuffer.join('\n')}`;
                ntfy({
                    channel: NTFY.NOTIFY_TOPIC,
                    title: 'Startup Summary',
                    message: batchedMsg
                });
            }, STARTUP_BATCH_WINDOW + 1000); // flush 1s after window ends
        }

        return; // skip individual notification
    }

    // Send regular (non-batched) notification
    ntfy({
        channel: ntfyChannel,
        title: title || `Log: ${level.toUpperCase()}`,
        message: finalMessage
    });
}
