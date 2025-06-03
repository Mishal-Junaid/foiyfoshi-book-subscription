const mongoose = require('mongoose');

const bankInformationSchema = new mongoose.Schema({
  bankName: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true
  },
  accountName: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true
  },
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    trim: true
  },
  routingNumber: {
    type: String,
    trim: true
  },
  swiftCode: {
    type: String,
    trim: true
  },
  iban: {
    type: String,
    trim: true
  },
  branch: {
    type: String,
    trim: true
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    default: 'MVR',
    trim: true
  },
  paymentInstructions: {
    type: String,
    trim: true,
    default: 'Please use your order number as the payment reference.'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  bankType: {
    type: String,
    enum: ['local', 'international'],
    default: 'local'
  },
  contactInfo: {
    email: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
bankInformationSchema.index({ isActive: 1, isPrimary: 1 });

// Virtual for full account details
bankInformationSchema.virtual('fullAccountDetails').get(function() {
  return `${this.bankName} - ${this.accountName} (${this.accountNumber})`;
});

// Ensure only one primary bank account
bankInformationSchema.pre('save', async function(next) {
  if (this.isPrimary && this.isNew) {
    await this.constructor.updateMany(
      { isPrimary: true, _id: { $ne: this._id } },
      { isPrimary: false }
    );
  }
  next();
});

module.exports = mongoose.model('BankInformation', bankInformationSchema); 