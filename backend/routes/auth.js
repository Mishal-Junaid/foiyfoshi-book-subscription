const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  verifyOTP,
  resendOTP,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  updateUserProfile,
  createDevAdmin,
  getDashboardStats,
} = require('../controllers/auth');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword', resetPassword);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.put('/update-profile', protect, updateUserProfile);

// Admin routes
router.get('/dashboard-stats', protect, authorize('admin'), getDashboardStats);

// Development only route
router.post('/create-dev-admin', createDevAdmin);

module.exports = router;
