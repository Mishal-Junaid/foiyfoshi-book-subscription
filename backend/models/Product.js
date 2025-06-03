const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          default: 'Product Image',
        },
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isCurrentBox: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: [
        'Monthly Box',
        'Special Edition',
        'Gift Box',
        'Children',
        'Fiction',
        'Non-Fiction',
        'Other',
      ],
    },
    theme: {
      type: String,
      required: [true, 'Please add a theme'],
    },
    itemsIncluded: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
      },
    ],
    stock: {
      type: Number,
      required: [true, 'Please add stock quantity'],
      default: 0,
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
