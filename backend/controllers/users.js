const User = require('../models/User');
const { ErrorResponse, asyncHandler } = require('../utils/errorHandler');

// @desc    Verify a user
// @route   PUT /api/users/:id/verify
// @access  Private/Admin
exports.verifyUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  if (user.isVerified) {
    return res.status(200).json({
      success: true,
      message: 'User is already verified',
      data: user,
    });
  }

  // Update user to verified status
  user.isVerified = true;
  // Clear any OTP data
  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User has been verified successfully',
    data: user,
  });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ErrorResponse('Email already in use', 400));
  }

  // Create a verified user directly (without OTP)
  const user = await User.create({
    ...req.body,
    isVerified: true,
  });

  res.status(201).json({
    success: true,
    data: user,
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  // If trying to change email, check if it's already in use
  if (req.body.email) {
    const emailExists = await User.findOne({
      email: req.body.email,
      _id: { $ne: req.params.id },
    });
    
    if (emailExists) {
      return next(new ErrorResponse('Email already in use', 400));
    }
  }

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get user activity log
// @route   GET /api/users/:id/activity
// @access  Private/Admin
exports.getUserActivity = asyncHandler(async (req, res, next) => {
  // This would typically fetch from a separate activity log collection
  // For now, we'll return a placeholder response
  res.status(200).json({
    success: true,
    message: 'This feature will track user logins, orders, and other activity',
    data: [],
  });
});
