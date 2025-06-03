const asyncHandler = require('express-async-handler');
const ContactMessage = require('../models/ContactMessage');
const sendEmail = require('../utils/sendEmail');

// @desc    Submit a new contact message
// @route   POST /api/contact
// @access  Public
exports.submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Create contact message
  const contactMessage = await ContactMessage.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject.trim(),
    message: message.trim(),
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Send notification email to admin (optional)
  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@foiyfoshi.mv',
      subject: `New Contact Form Submission: ${subject}`,
      text: `
New contact form submission received:

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

--
This message was submitted through the foiyfoshi contact form.
View and reply to this message in the admin dashboard.
      `,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>This message was submitted through the foiyfoshi contact form.<br>
        View and reply to this message in the admin dashboard.</em></p>
      `
    });
  } catch (emailError) {
    console.error('Failed to send admin notification email:', emailError);
    // Don't fail the request if email fails
  }

  res.status(201).json({
    success: true,
    message: 'Your message has been sent successfully! We\'ll get back to you soon.',
    data: {
      id: contactMessage._id,
      name: contactMessage.name,
      email: contactMessage.email,
      subject: contactMessage.subject,
      createdAt: contactMessage.createdAt
    }
  });
});

// @desc    Get all contact messages (admin only)
// @route   GET /api/contact/messages
// @access  Private/Admin
exports.getContactMessages = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const status = req.query.status;
  const category = req.query.category;
  const priority = req.query.priority;
  const search = req.query.search;

  // Build filter object
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;
  
  // Add search functionality
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Get messages with pagination
  const messages = await ContactMessage.find(filter)
    .populate('repliedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  // Get total count for pagination
  const total = await ContactMessage.countDocuments(filter);
  
  // Get statistics
  const stats = await ContactMessage.getStats();
  const unreadCount = await ContactMessage.getUnreadCount();

  res.json({
    success: true,
    data: messages,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMessages: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    },
    stats: {
      total,
      unread: unreadCount,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    }
  });
});

// @desc    Get single contact message (admin only)
// @route   GET /api/contact/messages/:id
// @access  Private/Admin
exports.getContactMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id)
    .populate('repliedBy', 'name email');

  if (!message) {
    res.status(404);
    throw new Error('Contact message not found');
  }

  // Mark as read if it's new
  if (message.status === 'new') {
    await message.markAsRead();
  }

  res.json({
    success: true,
    data: message
  });
});

// @desc    Reply to contact message
// @route   POST /api/contact/messages/:id/reply
// @access  Private/Admin
exports.replyToMessage = asyncHandler(async (req, res) => {
  const { replyMessage, adminNotes } = req.body;

  if (!replyMessage) {
    res.status(400);
    throw new Error('Reply message is required');
  }

  const message = await ContactMessage.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Contact message not found');
  }

  // Update message with reply
  await message.markAsReplied(req.user._id, replyMessage);
  
  // Update admin notes if provided
  if (adminNotes) {
    message.adminNotes = adminNotes;
    await message.save();
  }

  // Send reply email to the user
  try {
    await sendEmail({
      to: message.email,
      subject: `Re: ${message.subject}`,
      text: `
Dear ${message.name},

Thank you for contacting foiyfoshi. Here's our response to your message:

${replyMessage}

If you have any further questions, please don't hesitate to contact us.

Best regards,
The foiyfoshi Team

---
Original Message:
Subject: ${message.subject}
${message.message}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #805A29;">foiyfoshi</h2>
          
          <p>Dear ${message.name},</p>
          
          <p>Thank you for contacting foiyfoshi. Here's our response to your message:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #805A29; margin: 20px 0;">
            ${replyMessage.replace(/\n/g, '<br>')}
          </div>
          
          <p>If you have any further questions, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>The foiyfoshi Team</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <div style="color: #666; font-size: 0.9em;">
            <strong>Original Message:</strong><br>
            <strong>Subject:</strong> ${message.subject}<br>
            <strong>Date:</strong> ${message.createdAt.toLocaleDateString()}<br><br>
            ${message.message.replace(/\n/g, '<br>')}
          </div>
        </div>
      `
    });

    res.json({
      success: true,
      message: 'Reply sent successfully',
      data: message
    });
  } catch (emailError) {
    console.error('Failed to send reply email:', emailError);
    res.status(500);
    throw new Error('Reply was saved but failed to send email. Please try again.');
  }
});

// @desc    Update contact message status
// @route   PUT /api/contact/messages/:id/status
// @access  Private/Admin
exports.updateMessageStatus = asyncHandler(async (req, res) => {
  const { status, priority, category, adminNotes } = req.body;

  const message = await ContactMessage.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Contact message not found');
  }

  // Update fields
  if (status) message.status = status;
  if (priority) message.priority = priority;
  if (category) message.category = category;
  if (adminNotes !== undefined) message.adminNotes = adminNotes;

  await message.save();

  res.json({
    success: true,
    message: 'Message updated successfully',
    data: message
  });
});

// @desc    Delete contact message
// @route   DELETE /api/contact/messages/:id
// @access  Private/Admin
exports.deleteContactMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Contact message not found');
  }

  await ContactMessage.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Contact message deleted successfully'
  });
});

// @desc    Get contact message statistics
// @route   GET /api/contact/stats
// @access  Private/Admin
exports.getContactStats = asyncHandler(async (req, res) => {
  const stats = await ContactMessage.getStats();
  const unreadCount = await ContactMessage.getUnreadCount();
  const totalCount = await ContactMessage.countDocuments();

  // Get recent messages (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentCount = await ContactMessage.countDocuments({
    createdAt: { $gte: weekAgo }
  });

  res.json({
    success: true,
    data: {
      total: totalCount,
      unread: unreadCount,
      recent: recentCount,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    }
  });
}); 