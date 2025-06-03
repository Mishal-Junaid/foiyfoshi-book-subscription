const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: [true, 'Please add a section name'],
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
    },
    subtitle: {
      type: String,
    },
    content: {
      type: String,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          default: 'Content Image',
        },
      },
    ],
    links: [
      {
        url: {
          type: String,
        },
        text: {
          type: String,
        },
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Content', ContentSchema);
