const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  getFeaturedProducts,
  getCurrentBox,
  setCurrentBox,
} = require('../controllers/products');

const Product = require('../models/Product');
const { uploadProductImages: uploadImages } = require('../middleware/upload');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');

// Public routes
router.route('/').get(advancedResults(Product), getProducts);
router.route('/featured').get(getFeaturedProducts);
router.route('/current-box').get(getCurrentBox);
router.route('/:id').get(getProduct);

// Protected routes
router.use(protect);
router.use(authorize('admin'));

router.route('/').post(createProduct);
router.route('/:id')
  .put(updateProduct)
  .delete(deleteProduct);
router.route('/:id/images')
  .post(uploadImages, uploadProductImages);
router.route('/:id/images/:imageId')
  .delete(deleteProductImage);
router.route('/:id/set-current')
  .put(setCurrentBox);

module.exports = router;
