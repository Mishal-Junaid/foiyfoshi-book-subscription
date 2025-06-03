const fs = require('fs');
const path = require('path');
const Order = require('../models/Order');
const { ErrorResponse, asyncHandler } = require('../utils/errorHandler');

// @desc    Upload payment receipt
// @route   POST /api/payments/receipt/:orderId
// @access  Private
exports.uploadReceipt = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a receipt image', 400));
  }

  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.orderId}`, 404)
    );
  }

  // Check if order belongs to user or user is admin
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this order', 401));
  }

  // Check if payment method is bank transfer
  if (order.paymentMethod !== 'bankTransfer') {
    return next(
      new ErrorResponse('Receipt upload is only for bank transfer payments', 400)
    );
  }

  // Update order payment info
  order.paymentResult = {
    id: `receipt-${Date.now()}`,
    status: 'submitted',
    receiptUrl: `/uploads/receipts/${req.file.filename}`,
    updateTime: Date.now(),
  };

  await order.save();

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Get payment receipt
// @route   GET /api/payments/receipt/:orderId
// @access  Private
exports.getReceipt = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.orderId}`, 404)
    );
  }

  // Check if order belongs to user or user is admin
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this order', 401));
  }

  // Check if receipt exists
  if (
    !order.paymentResult ||
    !order.paymentResult.receiptUrl
  ) {
    return next(new ErrorResponse('No receipt found for this order', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      orderId: order._id,
      receiptUrl: order.paymentResult.receiptUrl,
      status: order.paymentResult.status,
      updateTime: order.paymentResult.updateTime,
    },
  });
});

// @desc    Delete payment receipt
// @route   DELETE /api/payments/receipt/:orderId
// @access  Private
exports.deleteReceipt = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.orderId}`, 404)
    );
  }

  // Check if order belongs to user or user is admin
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this order', 401));
  }

  // Check if receipt exists
  if (
    !order.paymentResult ||
    !order.paymentResult.receiptUrl
  ) {
    return next(new ErrorResponse('No receipt found for this order', 404));
  }

  // Delete receipt file
  const filePath = path.join(
    __dirname,
    '..',
    order.paymentResult.receiptUrl
  );

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Remove receipt from order
  order.paymentResult = undefined;
  await order.save();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Verify payment receipt
// @route   POST /api/payments/verify/:orderId
// @access  Admin
exports.verifyPayment = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.orderId}`, 404)
    );
  }

  // Only admin can verify payments
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Not authorized to verify payments', 401)
    );
  }

  // Check if payment receipt exists
  if (
    !order.paymentResult ||
    !order.paymentResult.receiptUrl
  ) {
    return next(
      new ErrorResponse('No receipt found to verify for this order', 404)
    );
  }

  // Update payment status
  order.paymentResult.status = 'verified';
  order.paymentResult.updateTime = Date.now();
  order.isPaid = true;
  order.paidAt = Date.now();

  await order.save();

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Reject payment receipt
// @route   POST /api/payments/reject/:orderId
// @access  Admin
exports.rejectPayment = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.orderId}`, 404)
    );
  }

  // Only admin can reject payments
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Not authorized to reject payments', 401)
    );
  }

  // Check if payment receipt exists
  if (
    !order.paymentResult ||
    !order.paymentResult.receiptUrl
  ) {
    return next(
      new ErrorResponse('No receipt found to reject for this order', 404)
    );
  }

  // Delete receipt file
  const filePath = path.join(
    __dirname,
    '..',
    order.paymentResult.receiptUrl
  );

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Update payment status and reason
  order.paymentResult = {
    status: 'rejected',
    reason: req.body.reason || 'Receipt verification failed',
    updateTime: Date.now(),
  };

  await order.save();

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Get all pending payments
// @route   GET /api/payments/pending
// @access  Admin
exports.getPendingPayments = asyncHandler(async (req, res, next) => {
  // Only admin can see all pending payments
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Not authorized to access pending payments', 401)
    );
  }

  const query = {
    paymentMethod: 'bankTransfer',
  };

  // Add status filter if provided
  if (req.query.status) {
    query['paymentResult.status'] = req.query.status;
  } else {
    // Default to pending verification (has receipt uploaded)
    query['paymentResult.receiptUrl'] = { $exists: true };
  }

  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort('-createdAt');

  const formattedOrders = orders.map(order => ({
    orderId: order._id,
    orderNumber: order.orderNumber,
    customerName: order.user.name,
    customerEmail: order.user.email,
    orderDate: order.createdAt,
    paymentMethod: order.paymentMethod,
    total: order.totalPrice,
    paymentStatus: order.paymentResult ? order.paymentResult.status : 'pending',
    receiptUrl: order.paymentResult ? order.paymentResult.receiptUrl : null
  }));

  res.status(200).json({
    success: true,
    count: formattedOrders.length,
    data: formattedOrders,
  });
});

// @desc    Send payment notification to customer
// @route   POST /api/payments/notification/:orderId
// @access  Admin
exports.sendPaymentNotification = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId).populate('user', 'name email');

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.orderId}`, 404)
    );
  }

  // Only admin can send notifications
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Not authorized to send payment notifications', 401)
    );
  }

  // Get the status and optional reason from request body
  const { status, reason } = req.body;
  
  if (!status) {
    return next(
      new ErrorResponse('Payment status is required', 400)
    );
  }

  // Send email based on status
  const sendEmail = require('../utils/sendEmail');
  
  if (status === 'verified') {
    // Send payment verified email
    await sendEmail({
      email: order.user.email,
      subject: `Payment Verified for Order #${order._id}`,
      message: `Dear ${order.user.name},\n\nYour payment for Order #${order._id} has been verified. Your order is now being processed.\n\nThank you for shopping with FoiyFoshi Books!`
    });
  } else if (status === 'rejected') {
    // Send payment rejected email
    await sendEmail({
      email: order.user.email,
      subject: `Action Required: Payment for Order #${order._id}`,
      message: `Dear ${order.user.name},\n\nWe couldn't verify your payment for Order #${order._id}.${reason ? ' Reason: ' + reason : ''}\n\nPlease upload a new payment receipt or contact customer support for assistance.\n\nThank you for your understanding.`
    });
  } else if (status === 'pending') {
    // Send payment receipt received email
    await sendEmail({
      email: order.user.email,
      subject: `Receipt Received for Order #${order._id}`,
      message: `Dear ${order.user.name},\n\nWe've received your payment receipt for Order #${order._id}. Our team will verify it shortly.\n\nThank you for your patience.`
    });
  }

  res.status(200).json({
    success: true,
    data: { message: `${status.charAt(0).toUpperCase() + status.slice(1)} notification sent to customer` },
  });
});

// @desc    Send payment pending notification
// @route   POST /api/payments/pending-notification/:orderId
// @access  Private
exports.sendPaymentPendingNotification = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId).populate('user', 'name email');

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.orderId}`, 404)
    );
  }

  // Check if order belongs to user or user is admin
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this order', 401));
  }

  // Send email notification
  const sendEmail = require('../utils/sendEmail');
  
  await sendEmail({
    email: order.user.email,
    subject: `Payment Being Processed for Order #${order._id}`,
    message: `Dear ${order.user.name},\n\nThank you for your order! We've received your payment receipt for Order #${order._id} and it is currently being verified.\n\nYou'll receive another email once your payment is confirmed.\n\nThank you for your patience and for choosing FoiyFoshi Books!`
  });

  res.status(200).json({
    success: true,
    data: { message: 'Payment pending notification sent to customer' },
  });
});
