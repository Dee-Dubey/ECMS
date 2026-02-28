const winston = require('winston');
const { format } = winston;
const DailyRotateFile = require('winston-daily-rotate-file');

/**
 * ---------------------------------------------------------------------
 * Log Format Definition
 * 
 * Description:
 * This defines a custom log format for the Winston logger. It combines:
 *   - A timestamp for each log entry
 *   - A printf formatter to output logs in the following structure:
 *       [timestamp] [level] : message
 * 
 * Example Output:
 *   2025-10-24T15:30:12.345Z [info] : Server started successfully
 * 
 * Notes:
 * - The format is used when creating Winston transports to standardize logs.
 * ---------------------------------------------------------------------
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127] 
*/
const logFormat = format.combine(
  format.timestamp(),
  format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}] : ${message}`;
  })
);

/**
 * ---------------------------------------------------------------------
 * Daily Rotate File Transport
 * 
 * Description:
 * This transport configuration uses 'winston-daily-rotate-file' to create
 * log files with automatic rotation based on the specified pattern.
 * 
 * Configuration:
 *   - filename: 'application-%DATE%.log' → log file name with date placeholder
 *   - dirname: 'logs' → directory where log files are saved
 *   - datePattern: 'YYYY' → rotates logs yearly (change pattern for daily/monthly)
 *   - maxSize: '2m' → maximum size per log file before rotation
 *   - maxFiles: '20' → keep the last 20 rotated files
 *   - format: logFormat → uses the previously defined custom log format
 *   - zippedArchive: true → compress rotated log files
 * 
 * Notes:
 * - Ensures old logs are archived and prevents excessive disk usage.
 * - Can be combined with console transports for live logging.
 * ---------------------------------------------------------------------
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127] 
*/
const transport = new DailyRotateFile({
  filename: 'application-%DATE%.log',
  dirname: 'logs',
  datePattern: 'YYYY',
  maxSize: '2m',
  maxFiles: '20',
  format: logFormat,
  zippedArchive: true
});

/**
 * ---------------------------------------------------------------------
 * Winston Logger Configuration
 * 
 * Description:
 * This creates a Winston logger instance with the following settings:
 *   - level: 'debug' → default log level (adjust as needed, e.g., 'info', 'warn')
 *   - format: logFormat → uses the custom timestamped log format defined earlier
 *   - transports:
 *       1. DailyRotateFile transport → logs written to files with automatic rotation
 *       2. Console transport → optional, outputs logs to the console in a simple format
 * 
 * Notes:
 * - Combining file and console transports allows persistent logging as well
 *   as real-time monitoring during development.
 * - Adjust 'level' per environment (e.g., 'debug' for dev, 'warn' for production).
 * ---------------------------------------------------------------------
 * Last Modified: 25 October 2025
 * Modified By: Raza A [AS-127] 
*/
const logger = winston.createLogger({
  level: 'debug', // Set default log level to 'warn'
  format: logFormat,
  transports: [
    transport,
    new winston.transports.Console({ format: winston.format.simple() }) // Optional console transport
  ],
});

module.exports = logger;
