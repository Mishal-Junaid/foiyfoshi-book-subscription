const Newsletter = require('../models/Newsletter');
const { ErrorResponse, asyncHandler } = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
exports.subscribe = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorResponse('Please provide an email address', 400));
  }

  // Check if email already exists
  let subscription = await Newsletter.findOne({ email });

  if (subscription) {
    if (subscription.isActive) {
      return next(new ErrorResponse('Email is already subscribed to newsletter', 400));
    } else {
      // Reactivate subscription
      subscription.isActive = true;
      subscription.subscribedAt = new Date();
      subscription.unsubscribedAt = undefined;
      await subscription.save();
    }
  } else {
    // Create new subscription
    subscription = await Newsletter.create({
      email,
      source: 'website',
    });
  }

  // Send welcome email
  try {
    await sendEmail({
      email: subscription.email,
      subject: 'Welcome to foiyfoshi Newsletter!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <header style="text-align: center; padding: 20px; background-color: #805A29;">
            <h1 style="color: #ffffff; margin: 0;">foiyfoshi</h1>
          </header>
          
          <div style="padding: 20px; border: 1px solid #eee; border-top: none;">
            <h2>Welcome to Our Newsletter!</h2>
            <p>Thank you for subscribing to the foiyfoshi newsletter!</p>
            
            <p>You'll now receive:</p>
            <ul>
              <li>Updates on new book box releases</li>
              <li>Exclusive promotions and discounts</li>
              <li>Reading recommendations</li>
              <li>Community events and book club announcements</li>
            </ul>
            
            <p>We're excited to have you as part of our reading community!</p>
            
            <p>Happy reading,<br>The foiyfoshi Team</p>
          </div>
          
          <footer style="text-align: center; padding: 15px; font-size: 12px; color: #666;">
            <p>You can unsubscribe at any time by clicking <a href="https://foiyfoshi.mv/unsubscribe?email=${subscription.email}">here</a></p>
            <p>&copy; ${new Date().getFullYear()} foiyfoshi. All rights reserved.</p>
          </footer>
        </div>
      `,
    });
  } catch (error) {
    console.log('Welcome email could not be sent', error);
    // Continue with subscription even if email fails
  }

  res.status(201).json({
    success: true,
    message: 'Successfully subscribed to newsletter',
    data: {
      email: subscription.email,
      subscribedAt: subscription.subscribedAt,
    },
  });
});

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @route   GET /api/newsletter/unsubscribe
// @access  Public
exports.unsubscribe = asyncHandler(async (req, res, next) => {
  // Handle both POST (email in body) and GET (email in query) requests
  const { email } = req.method === 'GET' ? req.query : req.body;

  if (!email) {
    return next(new ErrorResponse('Please provide an email address', 400));
  }

  const subscription = await Newsletter.findOne({ email });

  if (!subscription || !subscription.isActive) {
    return next(new ErrorResponse('Email is not subscribed to newsletter', 404));
  }

  subscription.isActive = false;
  subscription.unsubscribedAt = new Date();
  await subscription.save();

  res.status(200).json({
    success: true,
    message: 'Successfully unsubscribed from newsletter',
  });
});

// @desc    Get all newsletter subscribers
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
exports.getSubscribers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  // Filter options
  const filter = {};
  if (req.query.status === 'active') {
    filter.isActive = true;
  } else if (req.query.status === 'inactive') {
    filter.isActive = false;
  }

  const total = await Newsletter.countDocuments(filter);
  const subscribers = await Newsletter.find(filter)
    .sort({ subscribedAt: -1 })
    .limit(limit)
    .skip(startIndex);

  // Pagination result
  const pagination = {};

  if (startIndex + limit < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: subscribers.length,
    total,
    pagination,
    data: subscribers,
  });
});

// @desc    Send newsletter to all active subscribers
// @route   POST /api/newsletter/send
// @access  Private/Admin
exports.sendNewsletter = asyncHandler(async (req, res, next) => {
  const { subject, content, htmlContent } = req.body;

  if (!subject || (!content && !htmlContent)) {
    return next(new ErrorResponse('Please provide subject and content', 400));
  }

  // Get all active subscribers
  const subscribers = await Newsletter.find({ isActive: true });

  if (subscribers.length === 0) {
    return next(new ErrorResponse('No active subscribers found', 404));
  }

  const emailPromises = subscribers.map(subscriber => {
    const emailOptions = {
      email: subscriber.email,
      subject,
    };

    if (htmlContent) {
      emailOptions.html = htmlContent;
    } else {
      emailOptions.message = content;
    }

    return sendEmail(emailOptions).catch(error => {
      console.error(`Failed to send email to ${subscriber.email}:`, error);
      return { error: true, email: subscriber.email, message: error.message };
    });
  });

  const results = await Promise.all(emailPromises);
  
  // Count successful and failed emails
  const failed = results.filter(result => result && result.error);
  const successful = results.length - failed.length;

  res.status(200).json({
    success: true,
    message: `Newsletter sent to ${successful} subscribers`,
    data: {
      totalSubscribers: subscribers.length,
      successful,
      failed: failed.length,
      failedEmails: failed.map(f => ({ email: f.email, error: f.message })),
    },
  });
});

// @desc    Delete subscriber
// @route   DELETE /api/newsletter/subscribers/:id
// @access  Private/Admin
exports.deleteSubscriber = asyncHandler(async (req, res, next) => {
  const subscriber = await Newsletter.findById(req.params.id);

  if (!subscriber) {
    return next(new ErrorResponse('Subscriber not found', 404));
  }

  await subscriber.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Subscriber deleted successfully',
  });
});

// @desc    Add subscriber manually
// @route   POST /api/newsletter/subscribers
// @access  Private/Admin
exports.addSubscriber = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorResponse('Please provide an email address', 400));
  }

  // Check if email already exists
  let subscription = await Newsletter.findOne({ email });

  if (subscription) {
    if (subscription.isActive) {
      return next(new ErrorResponse('Email is already subscribed to newsletter', 400));
    } else {
      // Reactivate subscription
      subscription.isActive = true;
      subscription.subscribedAt = new Date();
      subscription.unsubscribedAt = undefined;
      subscription.source = 'admin';
      await subscription.save();
    }
  } else {
    // Create new subscription
    subscription = await Newsletter.create({
      email,
      source: 'admin',
    });
  }

  res.status(201).json({
    success: true,
    message: 'Subscriber added successfully',
    data: subscription,
  });
}); 