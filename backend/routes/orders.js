const express = require('express');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
  updateTrackingNumber,
  deleteOrder,
  getMyOrders,
  getOrderStats,
  uploadPaymentReceipt,
  generateInvoice,
} = require('../controllers/orders');

const Order = require('../models/Order');
const { uploadReceipt } = require('../middleware/upload');

const router = express.Router();

const { protect, authorize, verifiedOnly } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');

// All routes require authentication
router.use(protect);
router.use(verifiedOnly);

// My orders route
router.route('/myorders').get(getMyOrders);

// Order stats
router.route('/stats').get(authorize('admin'), getOrderStats);

// Receipt upload route
router.route('/:id/receipt').post(uploadReceipt, uploadPaymentReceipt);

// Public routes requiring verification only
router.route('/').post(createOrder);
router.route('/:id').get(getOrder);

// Admin routes
router
  .route('/')
  .get(authorize('admin'), advancedResults(Order, 'user products.product'), getOrders);

router
  .route('/:id')
  .get(getOrder)
  .put(authorize('admin'), updateOrderStatus)
  .delete(authorize('admin'), deleteOrder);

// Invoice route
router.route('/:id/invoice').get(generateInvoice);

router
  .route('/:id/status')
  .put(authorize('admin'), updateOrderStatus);

router
  .route('/:id/payment')
  .put(authorize('admin'), updatePaymentStatus);

router
  .route('/:id/tracking')
  .put(authorize('admin'), updateTrackingNumber);

module.exports = router;
