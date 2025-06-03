const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  }]
}, {
  timestamps: true
});

// Create compound index to ensure one wishlist per user
WishlistSchema.index({ user: 1 }, { unique: true });

// Populate products when querying
WishlistSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'products',
    select: 'name price images category stock'
  });
  next();
});

// Remove null products after population (in case some products were deleted)
WishlistSchema.post(/^find/, function(docs) {
  if (Array.isArray(docs)) {
    docs.forEach(doc => {
      if (doc && doc.products) {
        doc.products = doc.products.filter(product => product !== null);
      }
    });
  } else if (docs && docs.products) {
    docs.products = docs.products.filter(product => product !== null);
  }
});

module.exports = mongoose.model('Wishlist', WishlistSchema); 