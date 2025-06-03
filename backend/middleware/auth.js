const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

// Protect routes - only allow authenticated users
exports.protect = async (req, res, next) => {
  let token;
  // Check if auth header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
    
    // Log token for debugging (first 10 chars only for security)
    const tokenPreview = token ? token.substring(0, 10) + '...' : 'null';
    console.log('Auth middleware: Extracted token:', tokenPreview);
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }
  try {    // Development fallback authentication - ONLY for development
    if (token && token.includes('admin-fallback-token-') &&
        process.env.NODE_ENV === 'development' &&
        req.headers['x-admin-override'] === 'true' &&
        req.headers['admin-email'] === 'admin@foiyfoshi.mv') {
      
      // Create mock admin user for development
      req.user = {
        _id: 'dev-admin-id',
        email: 'admin@foiyfoshi.mv',
        role: 'admin',
        name: 'Development Admin'
      };
      
      return next();
    }
    
    // Normal flow - verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

// Verify user is verified
exports.verifiedOnly = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      error: 'Please verify your account first',
    });
  }
  next();
};

// Admin only middleware
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Only administrators can access this route',
    });
  }
  next();
};
