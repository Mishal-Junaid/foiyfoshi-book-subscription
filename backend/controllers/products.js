const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const { ErrorResponse, asyncHandler } = require('../utils/errorHandler');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res, next) => {
  // Extract product data from body
  const productData = { ...req.body };
  
  // Handle included items if provided as string
  if (productData.itemsIncluded && typeof productData.itemsIncluded === 'string') {
    try {
      productData.itemsIncluded = JSON.parse(productData.itemsIncluded);
    } catch (error) {
      return next(new ErrorResponse('Invalid items included format', 400));
    }
  }

  // Create product
  const product = await Product.create(productData);

  res.status(201).json({
    success: true,
    data: product,
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res, next) => {
  // Extract product data from body
  const productData = { ...req.body };
  
  // Handle included items if provided as string
  if (productData.itemsIncluded && typeof productData.itemsIncluded === 'string') {
    try {
      productData.itemsIncluded = JSON.parse(productData.itemsIncluded);
    } catch (error) {
      return next(new ErrorResponse('Invalid items included format', 400));
    }
  }

  // Find and update product
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Update product
  product = await Product.findByIdAndUpdate(req.params.id, productData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Delete product images
  if (product.images && product.images.length > 0) {
    product.images.forEach((image) => {
      // Extract filename from the URL
      const filename = image.url.split('/').pop();
      const imagePath = path.join(
        __dirname,
        '../uploads/products',
        filename
      );

      // Check if file exists before trying to delete
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Upload product images
// @route   POST /api/products/:id/images
// @access  Private/Admin
exports.uploadProductImages = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new ErrorResponse('Please upload at least one file', 400));
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Process uploaded files
  const images = req.files.map((file) => ({
    url: `/uploads/products/${file.filename}`,
    alt: req.body.alt || product.name || 'Product Image',
  }));

  // Add new images to the product
  product.images = [...product.images, ...images];
  await product.save();

  res.status(200).json({
    success: true,
    count: images.length,
    data: product.images,
  });
});

// @desc    Delete product image
// @route   DELETE /api/products/:id/images/:imageId
// @access  Private/Admin
exports.deleteProductImage = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Find the image in the product
  const imageIndex = product.images.findIndex(
    (image) => image._id.toString() === req.params.imageId
  );

  if (imageIndex === -1) {
    return next(new ErrorResponse('Image not found', 404));
  }

  // Get the image URL
  const imageUrl = product.images[imageIndex].url;
  
  // Extract filename from the URL
  const filename = imageUrl.split('/').pop();
  const imagePath = path.join(__dirname, '../uploads/products', filename);

  // Delete file if exists
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  // Remove image from product
  product.images.splice(imageIndex, 1);
  await product.save();

  res.status(200).json({
    success: true,
    data: product.images,
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 5;
  
  const products = await Product.find({ isFeatured: true })
    .limit(limit)
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get current month's subscription box
// @route   GET /api/products/current-box
// @access  Public
exports.getCurrentBox = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ isCurrentBox: true });

  if (!product) {
    return next(new ErrorResponse('No current subscription box found', 404));
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Set a product as current month's box
// @route   PUT /api/products/:id/set-current
// @access  Private/Admin
exports.setCurrentBox = asyncHandler(async (req, res, next) => {
  // First, unset any current box
  await Product.updateMany(
    { isCurrentBox: true },
    { isCurrentBox: false }
  );

  // Then set the new current box
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isCurrentBox: true },
    { new: true, runValidators: true }
  );

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    message: 'Product set as current subscription box',
    data: product,
  });
});
