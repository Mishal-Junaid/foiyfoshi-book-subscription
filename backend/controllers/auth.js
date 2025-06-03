const User = require('../models/User');
const { ErrorResponse, asyncHandler } = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  // Check if user already exists
  let user = await User.findOne({ email });

  if (user) {
    return next(new ErrorResponse('Email already registered', 400));
  }

  // Create user
  user = await User.create({
    name,
    email,
    phone,
    password,
    address: req.body.address || {},
  });

  // Generate OTP
  const otp = user.generateOTP();

  await user.save({ validateBeforeSave: false });

  // Create OTP email
  const otpEmail = {
    email: user.email,
    subject: 'FoiyFoshi Account Verification OTP',
    html: `
      <h1>Welcome to FoiyFoshi - Maldives Book Subscription Box</h1>
      <p>Your account verification OTP is: <strong>${otp}</strong></p>
      <p>This OTP will expire in 10 minutes.</p>
      <p>Thank you for joining our community of book lovers!</p>
    `,
  };
  try {
    const emailResult = await sendEmail(otpEmail);

    // Check if we're in development mode with Ethereal email
    if (emailResult && emailResult.developmentMode && emailResult.previewUrl) {
      console.log('Development mode: Email preview available at', emailResult.previewUrl);
      
      // In development, we'll include the OTP and preview URL in the response
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for OTP verification.',
        developmentInfo: {
          otp: otp,
          emailPreviewUrl: emailResult.previewUrl
        }
      });
    } else {
      // Standard production response
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for OTP verification.',
      });
    }
  } catch (err) {
    console.error('Email sending error:', err);
    
    // In development mode, allow registration even if email fails
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Continuing registration despite email failure');
      console.log('OTP for verification:', otp);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Email sending failed, but you can use the OTP from server logs.',
        developmentInfo: {
          otp: otp
        }
      });
    } else {
      // In production, handle the email failure by cleaning up and returning error
      user.otp = undefined;
      user.otpExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse('Email could not be sent', 500));
    }
  }
});

// @desc    Create development admin user
// @route   POST /api/auth/create-dev-admin
// @access  Public (Development only)
exports.createDevAdmin = asyncHandler(async (req, res, next) => {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return next(new ErrorResponse('This endpoint is only available in development mode', 403));
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@foiyfoshi.mv';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  // Check if admin already exists
  let admin = await User.findOne({ email: adminEmail });

  if (admin) {
    // If admin exists, just return success with token
    sendTokenResponse(admin, 200, res, 'Admin user already exists and logged in');
    return;
  }

  // Create admin user
  admin = await User.create({
    name: 'Admin User',
    email: adminEmail,
    phone: '+960 123-4567',
    password: adminPassword,
    role: 'admin',
    isVerified: true, // Skip verification for admin
    address: {
      street: 'Admin Street',
      city: 'Male',
      state: 'Kaafu',
      zipCode: '20026',
      country: 'Maldives'
    }
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Development admin user created successfully');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
  }

  sendTokenResponse(admin, 201, res, 'Development admin user created and logged in');
});

// @desc    Verify user with OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new ErrorResponse('Please provide email and OTP', 400));
  }

  // Find user by email
  const user = await User.findOne({
    email,
    otpExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired OTP', 400));
  }

  // Check if OTP matches
  if (user.otp !== otp) {
    return next(new ErrorResponse('Invalid OTP', 400));
  }

  // If OTP is correct, set user as verified
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Debug logging for admin bypass
  console.log('🔍 LOGIN DEBUG INFO:');
  console.log('User email:', user.email);
  console.log('User role:', user.role);
  console.log('User isVerified:', user.isVerified);
  console.log('Is admin role?:', user.role === 'admin');
  console.log('Should bypass verification?:', user.role === 'admin');

  // Skip verification for admin users OR if user is already verified
  if (!user.isVerified && user.role !== 'admin') {
    console.log('🚫 User requires verification - entering OTP flow');
    
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    // Create OTP email
    const otpEmail = {
      email: user.email,
      subject: 'FoiyFoshi Account Verification OTP',
      html: `
        <h1>FoiyFoshi - Account Verification</h1>
        <p>Your account verification OTP is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>Thank you for joining our community of book lovers!</p>
      `,
    };

    try {
      const emailResult = await sendEmail(otpEmail);

      // Check if we're in development mode with Ethereal email
      if (emailResult && emailResult.developmentMode && emailResult.previewUrl) {
        console.log('Development mode: Email preview available at', emailResult.previewUrl);
        
        return res.status(200).json({
          success: false,
          message: 'Account not verified. A new OTP has been sent to your email.',
          requiresVerification: true,
          developmentInfo: {
            otp: otp,
            emailPreviewUrl: emailResult.previewUrl
          }
        });
      } else {
        // Standard production response
        return res.status(200).json({
          success: false,
          message: 'Account not verified. A new OTP has been sent to your email.',
          requiresVerification: true,
        });
      }
    } catch (err) {
      console.error('Email sending error during login:', err);
      
      // In development mode, allow continuing even if email fails
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Continuing despite email failure');
        console.log('OTP for verification:', otp);
        
        return res.status(200).json({
          success: false,
          message: 'Account not verified. Email sending failed, but you can use the OTP from server logs.',
          requiresVerification: true,
          developmentInfo: {
            otp: otp
          }
        });
      } else {
        // If email sending fails in production, clear OTP from user
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be sent', 500));
      }
    }
  }

  // If user is admin or verified, log them in directly
  console.log('✅ BYPASSING VERIFICATION - Logging in user');
  if (user.role === 'admin') {
    console.log('🔑 Admin user login bypass - verification not required');
  }
  if (user.isVerified) {
    console.log('✅ User is already verified');
  }
  
  sendTokenResponse(user, 200, res);
});

// @desc    Resend verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorResponse('Please provide an email', 400));
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // If already verified
  if (user.isVerified) {
    return next(new ErrorResponse('User already verified', 400));
  }

  // Generate new OTP
  const otp = user.generateOTP();
  await user.save({ validateBeforeSave: false });

  // Create OTP email
  const otpEmail = {
    email: user.email,
    subject: 'FoiyFoshi Account Verification OTP',
    html: `
      <h1>FoiyFoshi - Account Verification</h1>
      <p>Your new account verification OTP is: <strong>${otp}</strong></p>
      <p>This OTP will expire in 10 minutes.</p>
      <p>Thank you for joining our community of book lovers!</p>
    `,
  };
  try {
    const emailResult = await sendEmail(otpEmail);

    // Check if we're in development mode with Ethereal email
    if (emailResult && emailResult.developmentMode && emailResult.previewUrl) {
      console.log('Development mode: Email preview available at', emailResult.previewUrl);
      
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully. Please check your email.',
        developmentInfo: {
          otp: otp,
          emailPreviewUrl: emailResult.previewUrl
        }
      });
    } else {
      // Standard production response
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully. Please check your email.',
      });
    }
  } catch (err) {
    console.error('Email sending error during resendOTP:', err);
    
    // In development mode, provide OTP even if email fails
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Continuing despite email failure');
      console.log('OTP for verification:', otp);
      
      res.status(200).json({
        success: true,
        message: 'Email sending failed, but you can use the OTP from server logs.',
        developmentInfo: {
          otp: otp
        }
      });
    } else {
      // If email sending fails in production, clear OTP from user
      user.otp = undefined;
      user.otpExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse('Email could not be sent', 500));
    }
  }
});

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
  };

  // Only include fields that are present in the request
  Object.keys(fieldsToUpdate).forEach(
    (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      new ErrorResponse('Please provide current and new password', 400)
    );
  }

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(currentPassword))) {
    return next(new ErrorResponse('Current password is incorrect', 401));
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorResponse('Please provide an email', 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse('User not found with that email', 404));
  }

  // Generate OTP
  const otp = user.generateOTP();
  await user.save({ validateBeforeSave: false });

  // Create reset email
  const resetEmail = {
    email: user.email,
    subject: 'FoiyFoshi Password Reset OTP',
    html: `
      <h1>FoiyFoshi - Password Reset</h1>
      <p>You requested a password reset. Your OTP is: <strong>${otp}</strong></p>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  try {
    await sendEmail(resetEmail);

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent successfully',
    });
  } catch (err) {
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Reset password using OTP
// @route   PUT /api/auth/resetpassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, password } = req.body;

  if (!email || !otp || !password) {
    return next(
      new ErrorResponse('Please provide email, OTP, and new password', 400)
    );
  }

  // Find user by email and check if OTP is still valid
  const user = await User.findOne({
    email,
    otp,
    otpExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired OTP', 400));
  }

  // Set new password
  user.password = password;
  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful. You can now login with your new password.',
  });
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, message = null) => {
  // Create token
  const token = user.getSignedJwtToken();

  const response = {
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      address: user.address,
      interests: user.interests,
      bio: user.bio,
    },
  };

  if (message) {
    response.message = message;
  }

  res.status(statusCode).json(response);
};

// @desc    Update user profile with interests and additional profile info
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateUserProfile = asyncHandler(async (req, res, next) => {
  // Get fields that can be updated
  const { interests, bio, address } = req.body;

  // Build the update object
  const updateFields = {};
  
  // Handle interests update
  if (interests) {
    updateFields.interests = interests;
  }
  
  // Handle bio update
  if (bio !== undefined) {
    updateFields.bio = bio;
  }
  
  // Handle address update
  if (address) {
    updateFields.address = address;
  }
  
  // If there's nothing to update, return early
  if (Object.keys(updateFields).length === 0) {
    return next(new ErrorResponse('No fields provided to update', 400));
  }

  // Update the user
  const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
    new: true, // Return the updated user
    runValidators: true,
  });

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get admin dashboard statistics
// @route   GET /api/auth/dashboard-stats
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  try {
    const User = require('../models/User');
    const Product = require('../models/Product');
    const Order = require('../models/Order');

    // Get all statistics in parallel
    const [
      totalProducts,
      totalOrders,
      totalUsers,
      pendingPayments
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.countDocuments({ 
        paymentMethod: 'bankTransfer', 
        paymentStatus: 'pending_verification' 
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalUsers,
        pendingPayments
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return next(new ErrorResponse('Failed to fetch dashboard statistics', 500));
  }
});
