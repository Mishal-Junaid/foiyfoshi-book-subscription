const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./config/db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Set default environment if not specified
if (!process.env.NODE_ENV) {
  console.log('NODE_ENV not specified, defaulting to development');
  process.env.NODE_ENV = 'development';
}

console.log(`Server starting in ${process.env.NODE_ENV} mode`);

// Connect to database
connectDB();

// Initialize express
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 1000, // Increased from 100 to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for admin endpoints in development
  skip: (req) => {
    if (process.env.NODE_ENV === 'development') {
      return true; // Skip rate limiting in development
    }
    return false;
  }
});

// Only apply rate limiting in production, and with more generous limits
if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
  console.log('🚦 Rate limiting enabled: 1000 requests per 15 minutes');
} else {
  console.log('🚦 Rate limiting disabled for development');
}

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://foiy-foshi.netlify.app',     // Primary Netlify URL (with hyphen)
        'https://foiyfoshi.netlify.app',      // Alternative URL (without hyphen)
        'https://your-custom-domain.com',     // Future custom domain
        process.env.CORS_ORIGIN               // Any additional CORS origin from env
      ].filter(Boolean)  // Remove undefined values
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-admin-override', 'admin-email']
};

// Debug CORS configuration
console.log('🌐 CORS Configuration:');
console.log('Environment:', process.env.NODE_ENV);
console.log('Allowed origins:', corsOptions.origin);
if (process.env.CORS_ORIGIN) {
  console.log('Additional CORS origin from env:', process.env.CORS_ORIGIN);
}

app.use(cors(corsOptions));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/content', require('./routes/content'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/contact', require('./routes/contactMessages'));
app.use('/api/bank', require('./routes/bankInformation'));

// Base route
app.get('/', (req, res) => {
  res.send('FoiyFoshi API is running...');
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});
