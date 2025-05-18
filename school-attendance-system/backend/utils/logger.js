// backend/utils/logger.js
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create log directory if it doesn't exist
const logDirectory = path.join(__dirname, '../logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// Define custom log formats
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`;
  })
);

// Create custom logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: [
    // Write all logs error (and below) to error.log
    new winston.transports.File({ 
      filename: path.join(logDirectory, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: path.join(logDirectory, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDirectory, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // Handle uncaught promise rejections
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDirectory, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// Add console transport in development environment
console.log('Setting up logger console transport. NODE_ENV =', process.env.NODE_ENV);
if (process.env.NODE_ENV !== 'production') {
  console.log('Adding console transport to logger (development mode)');
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
} else {
  console.log('Running in production mode - console transport not added by default');
  // Explicitly add console transport anyway for debugging
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Create specialized loggers
const createModuleLogger = (moduleName) => {
  return {
    debug: (message, meta = {}) => logger.debug(message, { module: moduleName, ...meta }),
    info: (message, meta = {}) => logger.info(message, { module: moduleName, ...meta }),
    warn: (message, meta = {}) => logger.warn(message, { module: moduleName, ...meta }),
    error: (message, meta = {}) => logger.error(message, { module: moduleName, ...meta }),
  };
};

// Create specialized loggers for different purposes
const authLogger = createModuleLogger('auth');
const attendanceLogger = createModuleLogger('attendance');
const studentLogger = createModuleLogger('student');
const teacherLogger = createModuleLogger('teacher');
const securityLogger = createModuleLogger('security');
const performanceLogger = createModuleLogger('performance');

// Create log stream for Morgan
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, 'access.log'),
  { flags: 'a' }
);

module.exports = {
  logger,
  authLogger,
  attendanceLogger,
  studentLogger,
  teacherLogger,
  securityLogger,
  performanceLogger,
  accessLogStream
};
