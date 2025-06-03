const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    shippingAddress: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      island: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['bankTransfer', 'cashOnDelivery'],
    },
    paymentResult: {
      id: String,
      status: String,
      receiptUrl: String,
      updateTime: String,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingNumber: {
      type: String,
    },
    paymentReceipt: {
      type: String, // filename of uploaded receipt
    },
    receiptUploadedAt: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'pending_verification', 'verified', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Generate order number before saving
OrderSchema.pre('save', async function (next) {
  // Only generate order number if it doesn't exist
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().substring(2); // Get last 2 digits of year
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Get month with leading zero
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); // Random 4-digit number
    
    this.orderNumber = `FF-${year}${month}-${randomNum}`;
    
    // Check if order number already exists, and regenerate if needed
    const Order = this.constructor;
    const existingOrder = await Order.findOne({ orderNumber: this.orderNumber });
    
    if (existingOrder) {
      // If collision, regenerate with a different random number
      const newRandomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      this.orderNumber = `FF-${year}${month}-${newRandomNum}`;
    }
  }
  
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
