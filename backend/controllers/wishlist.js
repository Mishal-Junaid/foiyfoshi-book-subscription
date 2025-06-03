const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { ErrorResponse, asyncHandler } = require('../utils/errorHandler');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = asyncHandler(async (req, res, next) => {
  let wishlist = await Wishlist.findOne({ user: req.user.id });
  
  if (!wishlist) {
    // Create empty wishlist if none exists
    wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    // Re-fetch to ensure population via pre-hook
    wishlist = await Wishlist.findOne({ user: req.user.id });
  }

  res.status(200).json({
    success: true,
    data: wishlist
  });
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
exports.addToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;

  if (!productId) {
    return next(new ErrorResponse('Product ID is required', 400));
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // First check if wishlist exists and if product is already in it
  let wishlist = await Wishlist.findOne({ user: req.user.id }).select('products').lean();
  
  console.log(`Adding product ${productId} to wishlist for user ${req.user.id}`);
  console.log('Current wishlist:', wishlist);
  
  if (!wishlist) {
    // Create new wishlist with the product
    wishlist = await Wishlist.create({ 
      user: req.user.id, 
      products: [productId] 
    });
    console.log(`Created new wishlist for user ${req.user.id} with product ${productId}`);
  } else {
    // Check if product already exists
    const productExists = wishlist.products.some(id => id.toString() === productId.toString());
    
    console.log(`Product exists check: ${productExists}`);
    console.log('Existing products:', wishlist.products.map(id => id.toString()));
    
    if (productExists) {
      console.log(`Product ${productId} already exists in wishlist for user ${req.user.id}`);
      // Don't return error, just return success with current wishlist
      const updatedWishlist = await Wishlist.findOne({ user: req.user.id });
      return res.status(200).json({
        success: true,
        data: updatedWishlist
      });
    }
    
    // Add product to existing wishlist using atomic operation
    const updateResult = await Wishlist.findOneAndUpdate(
      { user: req.user.id },
      { $addToSet: { products: productId } },
      { new: true }
    );
    console.log(`Added product ${productId} to existing wishlist for user ${req.user.id}`);
    console.log('Update result:', updateResult);
  }

  // Re-fetch to ensure fresh populated data
  const updatedWishlist = await Wishlist.findOne({ user: req.user.id });

  res.status(200).json({
    success: true,
    data: updatedWishlist
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  // Use findOneAndUpdate with $pull to remove all instances of the product atomically
  const result = await Wishlist.findOneAndUpdate(
    { user: req.user.id },
    { 
      $pull: { products: productId } // $pull removes all instances of the value
    },
    { 
      new: true,
      runValidators: true 
    }
  );
  
  if (!result) {
    return next(new ErrorResponse('Wishlist not found', 404));
  }

  console.log(`Removed all instances of product ${productId} from wishlist for user ${req.user.id}`);

  // The result already contains the updated wishlist with populated products
  res.status(200).json({
    success: true,
    message: 'Product removed from wishlist',
    data: result
  });
});

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
exports.checkWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  // Get wishlist without lean to handle both populated and non-populated cases
  const wishlist = await Wishlist.findOne({ user: req.user.id }).select('products');
  
  let isInWishlist = false;
  
  console.log(`Checking wishlist for user ${req.user.id}, product ${productId}`);
  
  if (wishlist && wishlist.products && wishlist.products.length > 0) {
    // Handle both populated objects and ObjectIds
    const existingProductIds = wishlist.products.map(product => {
      // If it's a populated object, get the _id, otherwise convert to string
      if (product && typeof product === 'object' && product._id) {
        return product._id.toString();
      }
      return product.toString();
    });
    const productIdString = productId.toString();
    console.log('Existing product IDs:', existingProductIds);
    console.log('Target product ID:', productIdString);
    isInWishlist = existingProductIds.includes(productIdString);
  }

  console.log(`Result: ${isInWishlist}`);

  res.status(200).json({
    success: true,
    data: { isInWishlist }
  });
});

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private
exports.clearWishlist = asyncHandler(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id });
  
  if (!wishlist) {
    return next(new ErrorResponse('Wishlist not found', 404));
  }

  wishlist.products = [];
  await wishlist.save();
  // Re-fetch to ensure fresh populated data
  const updatedWishlist = await Wishlist.findOne({ user: req.user.id });

  res.status(200).json({
    success: true,
    data: updatedWishlist
  });
}); 