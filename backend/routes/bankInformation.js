const express = require('express');
const router = express.Router();
const {
  getBankInformation,
  getBankInformationById,
  createBankInformation,
  updateBankInformation,
  deleteBankInformation,
  setPrimaryBank,
  getPrimaryBankInformation
} = require('../controllers/bankInformation');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/primary', getPrimaryBankInformation);

// Protected routes (admin only)
router.route('/')
  .get(protect, adminOnly, getBankInformation)
  .post(protect, adminOnly, createBankInformation);

router.route('/:id')
  .get(protect, adminOnly, getBankInformationById)
  .put(protect, adminOnly, updateBankInformation)
  .delete(protect, adminOnly, deleteBankInformation);

router.put('/:id/primary', protect, adminOnly, setPrimaryBank);

module.exports = router; 