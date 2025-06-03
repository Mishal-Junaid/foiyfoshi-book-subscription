const express = require('express');
const {
  subscribe,
  unsubscribe,
  getSubscribers,
  sendNewsletter,
  deleteSubscriber,
  addSubscriber,
} = require('../controllers/newsletter');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/unsubscribe', unsubscribe);

// Admin routes
router.use(protect);
router.use(authorize('admin'));

router.route('/subscribers')
  .get(getSubscribers)
  .post(addSubscriber);

router.delete('/subscribers/:id', deleteSubscriber);
router.post('/send', sendNewsletter);

module.exports = router; 