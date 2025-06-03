const express = require('express');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  clearWishlist
} = require('../controllers/wishlist');

const router = express.Router();

const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Wishlist routes
router.route('/')
  .get(getWishlist)
  .post(addToWishlist)
  .delete(clearWishlist);

router.route('/check/:productId')
  .get(checkWishlist);

router.route('/:productId')
  .delete(removeFromWishlist);

module.exports = router; 