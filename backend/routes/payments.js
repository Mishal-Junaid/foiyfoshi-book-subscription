const express = require('express');
const {
  uploadReceipt,
  getReceipt,
  deleteReceipt,
  verifyPayment,
  rejectPayment,
  getPendingPayments,
  sendPaymentNotification,
  sendPaymentPendingNotification
} = require('../controllers/payments');

const router = express.Router();

const { protect, verifiedOnly, adminOnly } = require('../middleware/auth');
const { uploadReceipt: uploadReceiptMiddleware } = require('../middleware/upload');

// All routes require authentication
router.use(protect);
router.use(verifiedOnly);

router
  .route('/receipt/:orderId')
  .post(uploadReceiptMiddleware, uploadReceipt)
  .get(getReceipt)
  .delete(deleteReceipt);

// User can request pending notification
router.post('/pending-notification/:orderId', sendPaymentPendingNotification);

// Admin routes
router.use(adminOnly);

router.post('/verify/:orderId', verifyPayment);
router.post('/reject/:orderId', rejectPayment);
router.get('/pending', getPendingPayments);
router.post('/notification/:orderId', sendPaymentNotification);

module.exports = router;
