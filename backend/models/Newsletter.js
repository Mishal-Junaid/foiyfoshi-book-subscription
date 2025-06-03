const mongoose = require('mongoose');

const NewsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
    },
    source: {
      type: String,
      enum: ['website', 'admin', 'import'],
      default: 'website',
    },
  },
  { timestamps: true }
);

// Index for faster queries
NewsletterSchema.index({ email: 1 });
NewsletterSchema.index({ isActive: 1 });

module.exports = mongoose.model('Newsletter', NewsletterSchema); 