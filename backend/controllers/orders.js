const Order = require('../models/Order');
const Product = require('../models/Product');
const { ErrorResponse, asyncHandler } = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get orders of current user
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id })
    .populate('products.product')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('products.product')
    .populate('user', 'name email phone');

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Check if order belongs to user or user is admin
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this order', 401));
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { products, shippingAddress, paymentMethod } = req.body;

  if (!products || products.length === 0) {
    return next(new ErrorResponse('Please add at least one product', 400));
  }

  // Get product details and calculate total price
  let totalPrice = 0;
  const orderItems = [];

  for (const item of products) {
    const product = await Product.findById(item.product);
    if (!product) {
      return next(new ErrorResponse(`Product not found with id: ${item.product}`, 404));
    }

    // Check if product is in stock
    if (product.stock < item.quantity) {
      return next(
        new ErrorResponse(
          `Product ${product.name} is out of stock or has insufficient quantity`,
          400
        )
      );
    }

    // Add product to order items
    orderItems.push({
      product: item.product,
      quantity: item.quantity,
      price: product.price,
    });

    // Calculate total price
    totalPrice += product.price * item.quantity;

    // Update product stock
    product.stock -= item.quantity;
    await product.save();
  }

  // Create order
  const order = await Order.create({
    user: req.user.id,
    products: orderItems,
    shippingAddress,
    paymentMethod,
    totalPrice,
  });

  // Send order confirmation email
  const orderConfirmationEmail = {
    email: req.user.email,
    subject: 'foiyfoshi - Order Confirmation',
    html: `
      <h1>Thank you for your order!</h1>
      <p>Your order number is: ${order._id}</p>
      <p>Total amount: MVR ${order.totalPrice.toFixed(2)}</p>
      <p>Payment method: ${order.paymentMethod === 'bankTransfer' ? 'Bank Transfer' : 'Cash on Delivery'}</p>
      <p>We will process your order shortly.</p>
      ${order.paymentMethod === 'bankTransfer' 
        ? '<p>Please upload your payment receipt in your account dashboard to confirm your order.</p>' 
        : ''}
      <p>Thank you for choosing foiyfoshi!</p>
    `,
  };

  try {
    await sendEmail(orderConfirmationEmail);
  } catch (error) {
    console.log('Email could not be sent', error);
    // Continue with order creation even if email fails
  }

  res.status(201).json({
    success: true,
    data: order,
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new ErrorResponse('Please provide order status', 400));
  }

  let order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Update status
  order.status = status;

  // Set delivered and delivery time if status is delivered
  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  await order.save();

  // Send order status update email
  const statusUpdateEmail = {
    email: req.user.email,
    subject: 'FoiyFoshi - Order Status Update',
    html: `
      <h1>Your order status has been updated!</h1>
      <p>Order number: ${order._id}</p>
      <p>New status: ${status}</p>
      <p>Thank you for choosing FoiyFoshi!</p>
    `,
  };

  try {
    await sendEmail(statusUpdateEmail);
  } catch (error) {
    console.log('Email could not be sent', error);
    // Continue with order update even if email fails
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Update order payment status
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
exports.updatePaymentStatus = asyncHandler(async (req, res, next) => {
  const { isPaid, paymentStatus } = req.body;

  let order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Update payment status based on the new paymentStatus field or legacy isPaid
  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'verified') {
      order.isPaid = true;
      order.paidAt = Date.now();
    } else if (paymentStatus === 'rejected') {
      order.isPaid = false;
      order.paidAt = undefined;
    }
  } else if (isPaid !== undefined) {
    // Legacy support for isPaid field
    order.isPaid = isPaid;
    if (isPaid) {
      order.paidAt = Date.now();
      order.paymentStatus = 'verified';
    } else {
      order.paidAt = undefined;
      order.paymentStatus = 'rejected';
    }
  }

  await order.save();

  // Send appropriate email notification
  try {
    let emailContent;
    
    if (order.paymentStatus === 'verified') {
      // Payment verified email
      emailContent = {
        email: order.user.email,
        subject: `Payment Verified - Order #${order.orderNumber || order._id.toString().slice(-6).toUpperCase()} - foiyfoshi`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <header style="text-align: center; padding: 20px; background-color: #805A29;">
              <h1 style="color: #ffffff; margin: 0;">foiyfoshi</h1>
            </header>
            
            <div style="padding: 20px; border: 1px solid #eee; border-top: none;">
              <h2>Payment Verified!</h2>
              <p>Dear ${order.user.name},</p>
              
              <p>Great news! We've received and verified your payment for order <strong>#${order.orderNumber || order._id.toString().slice(-6).toUpperCase()}</strong>.</p>
              
              <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h3 style="margin-top: 0; color: #805A29;">Order Summary:</h3>
                <p><strong>Order Number:</strong> #${order.orderNumber || order._id.toString().slice(-6).toUpperCase()}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> MVR ${order.totalPrice.toFixed(2)}</p>
              </div>
              
              <p>Your order is now being processed and will be shipped shortly. You'll receive another email with tracking information once your order is on its way.</p>
              
              <p>Thank you for choosing foiyfoshi for your reading adventures!</p>
              
              <p>Regards,<br>The foiyfoshi Team</p>
            </div>
            
            <footer style="text-align: center; padding: 15px; font-size: 12px; color: #666;">
              <p>If you have any questions, please contact our support at support@foiyfoshi.mv</p>
              <p>&copy; ${new Date().getFullYear()} foiyfoshi. All rights reserved.</p>
            </footer>
          </div>
        `,
      };
    } else if (order.paymentStatus === 'rejected') {
      // Payment rejected email
      emailContent = {
        email: order.user.email,
        subject: `Action Required: Payment Issue - Order #${order.orderNumber || order._id.toString().slice(-6).toUpperCase()} - foiyfoshi`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <header style="text-align: center; padding: 20px; background-color: #805A29;">
              <h1 style="color: #ffffff; margin: 0;">foiyfoshi</h1>
            </header>
            
            <div style="padding: 20px; border: 1px solid #eee; border-top: none;">
              <h2>Payment Verification Issue</h2>
              <p>Dear ${order.user.name},</p>
              
              <p>We're writing to inform you that we couldn't verify the payment receipt for your order <strong>#${order.orderNumber || order._id.toString().slice(-6).toUpperCase()}</strong>.</p>
              
              <div style="background-color: #fff8e1; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #ffc107;">
                <h3 style="margin-top: 0; color: #805A29;">What's Next:</h3>
                <p>Please log in to your foiyfoshi account and upload a clear image of your payment receipt for this order.</p>
                <p>Make sure the receipt shows:</p>
                <ul>
                  <li>Transaction date and time</li>
                  <li>Transaction amount (MVR ${order.totalPrice.toFixed(2)})</li>
                  <li>Reference number</li>
                </ul>
              </div>
              
              <a href="${process.env.FRONTEND_URL || 'https://foiyfoshi.mv'}/dashboard/orders" style="display: inline-block; background-color: #805A29; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px;">Upload Receipt</a>
              
              <p style="margin-top: 20px;">If you believe this is an error or need assistance, please contact our customer support team.</p>
              
              <p>Thank you for your understanding.</p>
              
              <p>Regards,<br>The foiyfoshi Team</p>
            </div>
            
            <footer style="text-align: center; padding: 15px; font-size: 12px; color: #666;">
              <p>If you have any questions, please contact our support at support@foiyfoshi.mv</p>
              <p>&copy; ${new Date().getFullYear()} foiyfoshi. All rights reserved.</p>
            </footer>
          </div>
        `,
      };
    }

    if (emailContent) {
      await sendEmail(emailContent);
    }
  } catch (error) {
    console.log('Email could not be sent', error);
    // Continue with order update even if email fails
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Update order tracking number
// @route   PUT /api/orders/:id/tracking
// @access  Private/Admin
exports.updateTrackingNumber = asyncHandler(async (req, res, next) => {
  const { trackingNumber } = req.body;

  if (!trackingNumber) {
    return next(new ErrorResponse('Please provide tracking number', 400));
  }

  let order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Update tracking number
  order.trackingNumber = trackingNumber;
  await order.save();

  // Send tracking information email
  const trackingEmail = {
    email: req.user.email,
    subject: 'foiyfoshi - Order Shipped',
    html: `
      <h1>Your order has been shipped!</h1>
      <p>Order number: ${order._id}</p>
      <p>Tracking number: ${trackingNumber}</p>
      <p>You can track your package using this number.</p>
      <p>Thank you for choosing foiyfoshi!</p>
    `,
  };

  try {
    await sendEmail(trackingEmail);
  } catch (error) {
    console.log('Email could not be sent', error);
    // Continue with order update even if email fails
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
exports.getOrderStats = asyncHandler(async (req, res, next) => {
  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({ status: 'pending' });
  const processingOrders = await Order.countDocuments({ status: 'processing' });
  const shippedOrders = await Order.countDocuments({ status: 'shipped' });
  const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
  const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
  
  // Calculate total revenue
  const orders = await Order.find({ isPaid: true });
  const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

  res.status(200).json({
    success: true,
    data: {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      paidOrders: orders.length,
    },
  });
});

// @desc    Upload payment receipt
// @route   POST /api/orders/:id/receipt
// @access  Private
exports.uploadPaymentReceipt = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Check if user owns this order or is admin
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to upload receipt for this order', 401));
  }

  if (!req.file) {
    return next(new ErrorResponse('Please upload a receipt file', 400));
  }

  // Update order with receipt information
  order.paymentReceipt = req.file.filename;
  order.receiptUploadedAt = Date.now();
  
  // If this is a bank transfer order, mark it as pending verification
  if (order.paymentMethod === 'bankTransfer') {
    order.paymentStatus = 'pending_verification';
  }

  await order.save();

  res.status(200).json({
    success: true,
    data: {
      orderId: order._id,
      receiptFilename: req.file.filename,
      message: 'Receipt uploaded successfully. Your payment will be verified shortly.'
    },
  });
});

// @desc    Generate and download invoice PDF
// @route   GET /api/orders/:id/invoice
// @access  Private
exports.generateInvoice = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('products.product')
    .populate('user', 'name email phone');

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Check if order belongs to user or user is admin
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this order', 401));
  }

  // Generate PDF invoice
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument();

  // Set response headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);

  // Pipe the PDF to the response
  doc.pipe(res);

  // Add invoice content
  doc.fontSize(20).text('foiyfoshi', 50, 50);
  doc.fontSize(16).text('INVOICE', 50, 80);
  
  doc.fontSize(12);
  doc.text(`Invoice Number: ${order.orderNumber || order._id}`, 50, 120);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 140);
  doc.text(`Due Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 160);

  // Customer information
  doc.text('Bill To:', 50, 200);
  doc.text(`${order.user.name}`, 50, 220);
  doc.text(`${order.user.email}`, 50, 240);
  if (order.user.phone) {
    doc.text(`${order.user.phone}`, 50, 260);
  }

  // Shipping address
  if (order.shippingAddress) {
    doc.text('Ship To:', 300, 200);
    doc.text(`${order.shippingAddress.street}`, 300, 220);
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.island}`, 300, 240);
    doc.text(`${order.shippingAddress.postalCode}`, 300, 260);
  }

  // Order items table header
  let yPosition = 320;
  doc.text('Item', 50, yPosition);
  doc.text('Qty', 300, yPosition);
  doc.text('Price', 350, yPosition);
  doc.text('Total', 450, yPosition);
  
  // Draw line under header
  doc.moveTo(50, yPosition + 15).lineTo(500, yPosition + 15).stroke();
  
  yPosition += 30;

  // Order items
  order.products.forEach((item) => {
    const product = item.product;
    const itemTotal = item.price * item.quantity;
    
    doc.text(product.name || 'Product', 50, yPosition);
    doc.text(item.quantity.toString(), 300, yPosition);
    doc.text(`MVR ${item.price.toFixed(2)}`, 350, yPosition);
    doc.text(`MVR ${itemTotal.toFixed(2)}`, 450, yPosition);
    
    yPosition += 20;
  });

  // Draw line before totals
  yPosition += 10;
  doc.moveTo(300, yPosition).lineTo(500, yPosition).stroke();
  
  yPosition += 20;

  // Totals
  doc.text('Subtotal:', 350, yPosition);
  doc.text(`MVR ${order.totalPrice.toFixed(2)}`, 450, yPosition);
  
  yPosition += 20;
  doc.text('Shipping:', 350, yPosition);
  doc.text('MVR 0.00', 450, yPosition);
  
  yPosition += 20;
  doc.fontSize(14).text('Total:', 350, yPosition);
  doc.text(`MVR ${order.totalPrice.toFixed(2)}`, 450, yPosition);

  // Payment information
  yPosition += 40;
  doc.fontSize(12);
  doc.text(`Payment Method: ${order.paymentMethod === 'bankTransfer' ? 'Bank Transfer' : 'Cash on Delivery'}`, 50, yPosition);
  doc.text(`Payment Status: ${order.isPaid ? 'Paid' : 'Pending'}`, 50, yPosition + 20);
  
  if (order.paidAt) {
    doc.text(`Paid On: ${new Date(order.paidAt).toLocaleDateString()}`, 50, yPosition + 40);
  }

  // Footer
  doc.text('Thank you for your business!', 50, yPosition + 80);
  doc.text('foiyfoshi - Your trusted book partner', 50, yPosition + 100);

  // Finalize the PDF
  doc.end();
});
