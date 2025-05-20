// server.js
console.log('Starting server initialization...');
require('dotenv').config(); // If using dotenv to manage environment variables

// Check NODE_ENV and other critical environment variables
console.log('Environment information:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set (defaults to development)');
console.log('PORT:', process.env.PORT || '5001 (default)');
console.log('MongoDB URI configured:', process.env.MONGO_URI ? 'Yes' : 'No (using default)');

// Test for stdout buffering issues
process.stdout.write('Testing process.stdout.write... ');
process.stdout.write('OK\n');

const express = require('express');
console.log('Express loaded');
const cors = require('cors');
console.log('CORS loaded');
const mongoose = require('mongoose');
console.log('Mongoose loaded');
const morgan = require('morgan');
console.log('Morgan loaded');
const helmet = require('helmet');
console.log('Helmet loaded');
const cookieParser = require('cookie-parser');
console.log('Cookie parser loaded');
const fs = require('fs');
const path = require('path');
const rfs = require('rotating-file-stream');
console.log('FS, Path and RFS loaded');
const { validationResult } = require('express-validator');
console.log('Express validator loaded');
const csrf = require('csrf-csrf');
console.log('CSRF protection loaded');
const rateLimit = require('express-rate-limit');
console.log('Rate limiter loaded');
const jwt = require('jsonwebtoken');
console.log('JWT loaded');

// Log before loading logger module
console.log('About to load logger module...');
const { 
  logger, 
  accessLogStream, 
  securityLogger, 
  performanceLogger 
} = require('./utils/logger');
console.log('Logger module loaded successfully');

console.log('Loading routes...');

const teacherRoutes = require('./routes/teachers'); // Import teacher routes
const authRoutes = require('./routes/auth'); // Auth routes
const adminRoutes = require('./routes/admin'); // Import admin routes
const studentRoutes = require('./routes/students'); // Import student routes
const attendanceRoutes = require('./routes/attendance'); //import attend routes
const gradeRoutes = require('./routes/grades'); //import grade routes
const adminManagementRoutes = require('./routes/adminManagement'); // Import admin management routes
const notificationRoutes = require('./routes/notifications'); // Import notification routes

// Add global unhandled exception and rejection handlers
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(error.name, error.message);
  console.error(error.stack);
  // Give the logger time to write to file before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(error);
  // Give the logger time to write to file before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

const app = express();
const PORT = process.env.PORT || 5001;

// Create a log directory if it doesn't exist
const logDirectory = path.join(__dirname, 'logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// CSRF Protection configuration
const csrfOptions = {
  // Required options
  getSecret: () => {
    if (!process.env.CSRF_SECRET) {
      logger.warn('CSRF_SECRET environment variable not set! Using a random value for this session only.');
      // Generate a random secret but store it for the lifetime of the server
      if (!global.csrfSecret) {
        global.csrfSecret = require('crypto').randomBytes(32).toString('hex');
      }
      return global.csrfSecret;
    }
    return process.env.CSRF_SECRET;  },
  getSessionIdentifier: (req) => {
    // First try to get session ID from cookie
    if (req.cookies.sessionId) {
      return req.cookies.sessionId;
    }
    
    // If JWT is available, we can use userId from it as a more reliable identifier
    if (req.cookies.token) {
      try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        if (decoded && decoded.userId) {
          return `user-${decoded.userId}`;
        }
      } catch (err) {
        // Token verification failed, continue to fallback
      }
    }
    
    // IP fallback as last resort (not ideal but better than nothing)
    return req.ip || '';
  },

  // Cookie configuration  cookieName: 'csrf-token', // Updated for development (remove __Host- prefix)
  headerName: 'X-CSRF-Token', // Explicitly define the header name
  cookieOptions: {
    httpOnly: true,
    secure: true, // Required for SameSite=None
    sameSite: 'none', // Allow cross-site cookies
    path: '/'
  },
    // Other settings
  size: 64, // token length
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS']
  // Removed duplicate getCsrfTokenFromRequest as headerName is already set
};

// Initialize CSRF protection
const { doubleCsrfProtection, generateCsrfToken } = csrf.doubleCsrf(csrfOptions);

// Middleware setup
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://yourproductiondomain.com' 
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-CSRF-Token',
    'Cache-Control',
    'Pragma',
    'Expires',
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
}));
app.use(express.json());
app.use(cookieParser()); // Parse cookies

// Setup Morgan logging based on environment
if (process.env.NODE_ENV === 'production') {
  // Use combined format for production with output to rotating log file
  app.use(morgan('combined', { stream: accessLogStream }));
  
  // Also track response time in production for performance monitoring
  app.use(morgan(':method :url :status :response-time ms', {
    stream: {
      write: (message) => {
        // Log any slow responses (over 1000ms) for investigation
        const responseTime = message.match(/ (\d+\.\d+) ms/);
        if (responseTime && parseFloat(responseTime[1]) > 1000) {
          performanceLogger.warn(`Slow response detected: ${message.trim()}`);
        }
      }
    }
  }));
} else {
  // For development, use a more verbose format with colors
  app.use(morgan('dev'));
  // Debug middleware for CSRF issues
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.path.startsWith('/api/')) {
      logger.debug(`CSRF Debug - Request to ${req.path}:`);
      logger.debug(`Headers: ${JSON.stringify(req.headers)}`);
      
      // Log CSRF token from request (if exists)
      if (req.headers['x-csrf-token']) {
        logger.debug(`CSRF Token (truncated): ${req.headers['x-csrf-token'].substring(0, 10)}...`);
      } else {
        logger.debug('No CSRF token found in request headers');
      }
      
      if (req.cookies) logger.debug(`Cookies: ${JSON.stringify(req.cookies)}`);
    }
    next();
  });
  
  // Also track response time in development
  app.use(morgan(':method :url :status :response-time ms', {
    stream: {
      write: (message) => {
        const responseTime = message.match(/ (\d+\.\d+) ms/);
        if (responseTime && parseFloat(responseTime[1]) > 500) {
          performanceLogger.warn(`Slow response detected: ${message.trim()}`);
        }
      }
    }
  }));
}

// Log security related events
app.use((req, res, next) => {
  // Check for suspicious requests (potential security issues)
  const suspiciousParams = ['<script>', 'eval(', 'javascript:', 'onerror', 'onload', 'document.cookie'];
  const reqUrl = req.url.toLowerCase();
  const reqBody = req.body ? JSON.stringify(req.body).toLowerCase() : '';
  
  for (const param of suspiciousParams) {
    if (reqUrl.includes(param) || reqBody.includes(param)) {
      securityLogger.warn('Potential XSS attack detected', { 
        ip: req.ip,
        method: req.method,
        url: req.url,
        headers: req.headers
      });
      break;
    }
  }
  
  next();
});

// Helmet security configuration
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow cross-origin resource loading
  xssFilter: true, // Instead of using helmet.xssFilter() separately
  noSniff: true, // Instead of using helmet.noSniff() separately
  hidePoweredBy: true, // Instead of using helmet.hidePoweredBy() separately
  frameguard: { action: 'deny' }, // Instead of using helmet.frameguard() separately
  hsts: {
    maxAge: 15552000, // 180 days in seconds
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }, // Added referrer policy
  crossOriginOpenerPolicy: { policy: 'same-origin' } // Added cross-origin opener policy
}));

// Routes that don't need CSRF protection (public auth endpoints)
// Set up specific auth route endpoints to bypass CSRF
app.use('/api/auth/login', authRoutes);
app.use('/api/auth/register', authRoutes);
app.use('/api/auth/reset-password-request', authRoutes);
app.use('/api/auth/reset-password', authRoutes);
app.use('/api/auth/logout', authRoutes);  // Make logout public

// Apply CSRF protection for all routes AFTER the public endpoints
app.use(doubleCsrfProtection);

// Configure Content Security Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https://via.placeholder.com"],
    connectSrc: ["'self'", 
      process.env.NODE_ENV === 'production' 
        ? (process.env.FRONTEND_URL || "https://yourproductiondomain.com") 
        : "http://localhost:3000", 
      process.env.NODE_ENV === 'production'
        ? (process.env.BACKEND_URL || "https://api.yourproductiondomain.com")
        : "http://localhost:5001"
    ]
  }
}));

// Create rate limiter for CSRF token endpoint
const csrfTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { 
    error: 'Too many CSRF token requests, please try again later' 
  }
});

// CSRF token endpoint with rate limiting
app.get('/api/csrf-token', csrfTokenLimiter, (req, res) => {
  try {
    // Log headers for debugging
    console.log('CSRF token request headers:', req.headers);
    
    console.log('Generating CSRF token...');
    const token = generateCsrfToken(req, res, { overwrite: true });
    console.log(`CSRF token generated successfully: ${token.substring(0, 10)}...`);
    
    // No need to set cookie manually - the middleware already did it
    
    // Set CORS headers explicitly for this endpoint
    res.set('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL || 'https://yourproductiondomain.com' 
      : 'http://localhost:3000');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    
    return res.json({ csrfToken: token });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return res.status(500).json({ error: 'Failed to generate CSRF token' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// All other auth routes with CSRF protection (except those already mounted)
app.use('/api/auth', doubleCsrfProtection, authRoutes);

// All protected API routes (already have CSRF protection globally)
app.use('/api/teachers', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-management', adminManagementRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/notifications', notificationRoutes);

// Define rate limiters for different types of endpoints
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

// Apply the standard rate limiter to all requests
app.use(standardLimiter);

// More strict rate limit for authentication endpoints
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// MongoDB connection and server startup
console.log('Attempting to connect to MongoDB...');
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/school-management';
console.log(`Using MongoDB URI: ${mongoURI.replace(/\/\/([^:]+):[^@]+@/, '//***:***@')}`); // Hide credentials if present

// Function to start the server
function startServer() {
  try {
    console.log('Attempting to start server...');
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      logger.info(`Server started and listening on port ${PORT}`);
      
      // Log to ensure console output is working
      console.log('Console logging is working');
      console.error('Testing error output channel');
    });

    // Add error handlers to catch issues
    server.on('error', (error) => {
      console.error('Server failed to start:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try a different port.`);
      }
    });
  } catch (error) {
    console.error('Unhandled exception during server startup:', error);
  }
}

// Connect to MongoDB first, then start server
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully!');
  // Start server only after successful DB connection
  startServer();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.error('Error details:', JSON.stringify(err, null, 2));
  process.exit(1); // Exit with error code
});
