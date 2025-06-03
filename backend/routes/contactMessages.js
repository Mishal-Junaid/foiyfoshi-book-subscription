const express = require('express');
const router = express.Router();
const {
  submitContactMessage,
  getContactMessages,
  getContactMessage,
  replyToMessage,
  updateMessageStatus,
  deleteContactMessage,
  getContactStats
} = require('../controllers/contactMessages');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.route('/').post(submitContactMessage);

// Admin routes
router.route('/messages').get(protect, adminOnly, getContactMessages);
router.route('/messages/:id').get(protect, adminOnly, getContactMessage);
router.route('/messages/:id/reply').post(protect, adminOnly, replyToMessage);
router.route('/messages/:id/status').put(protect, adminOnly, updateMessageStatus);
router.route('/messages/:id').delete(protect, adminOnly, deleteContactMessage);
router.route('/stats').get(protect, adminOnly, getContactStats);

module.exports = router; 