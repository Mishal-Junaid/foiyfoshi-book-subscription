const multer = require('multer');
const path = require('path');
const { ErrorResponse } = require('../utils/errorHandler');

// Configure storage for product images
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/products'));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `product-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Configure storage for content images
const contentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destPath = path.join(__dirname, '../uploads/content');
    
    // Check if directory exists
    const fs = require('fs');
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    
    cb(null, destPath);
  },
  filename: function (req, file, cb) {
    const filename = `content-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

// Configure storage for payment receipts
const receiptStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destPath = path.join(__dirname, '../uploads/receipts');
    
    // Check if directory exists and create it if it doesn't
    const fs = require('fs');
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    
    cb(null, destPath);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `receipt-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedFileTypes = /jpeg|jpg|png|webp/;
  
  // Check file extension
  const extname = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  
  // Check mime type
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(
      new ErrorResponse(
        'Only images with extensions jpeg, jpg, png, webp are allowed',
        400
      )
    );
  }
};

// Create multer instances
exports.uploadProductImages = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
}).array('images', 5); // Allow up to 5 images

exports.uploadContentImages = multer({
  storage: contentStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
}).array('images', 10); // Allow up to 10 images for content

exports.uploadReceipt = multer({
  storage: receiptStorage,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
  },
  fileFilter: fileFilter,
}).single('receipt');
