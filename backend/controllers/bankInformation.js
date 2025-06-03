const asyncHandler = require('express-async-handler');
const BankInformation = require('../models/BankInformation');

// @desc    Get all bank information
// @route   GET /api/bank
// @access  Public (for checkout) / Admin (for management)
exports.getBankInformation = asyncHandler(async (req, res) => {
  const { active, primary } = req.query;
  
  let filter = {};
  
  // For public access, only show active accounts
  if (!req.user || req.user.role !== 'admin') {
    filter.isActive = true;
  } else {
    // Admin can filter by active status
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }
  }
  
  // Filter by primary status
  if (primary !== undefined) {
    filter.isPrimary = primary === 'true';
  }
  
  const bankAccounts = await BankInformation.find(filter)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .sort({ isPrimary: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bankAccounts.length,
    data: bankAccounts
  });
});

// @desc    Get single bank information
// @route   GET /api/bank/:id
// @access  Admin
exports.getBankInformationById = asyncHandler(async (req, res) => {
  const bankAccount = await BankInformation.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!bankAccount) {
    return res.status(404).json({
      success: false,
      error: 'Bank information not found'
    });
  }

  res.status(200).json({
    success: true,
    data: bankAccount
  });
});

// @desc    Create new bank information
// @route   POST /api/bank
// @access  Admin
exports.createBankInformation = asyncHandler(async (req, res) => {
  const {
    bankName,
    accountName,
    accountNumber,
    routingNumber,
    swiftCode,
    iban,
    branch,
    currency,
    paymentInstructions,
    isActive,
    isPrimary,
    bankType,
    contactInfo
  } = req.body;

  // Add admin user as creator and updater
  const bankData = {
    bankName,
    accountName,
    accountNumber,
    routingNumber,
    swiftCode,
    iban,
    branch,
    currency,
    paymentInstructions,
    isActive,
    isPrimary,
    bankType,
    contactInfo,
    createdBy: req.user._id,
    updatedBy: req.user._id
  };

  const bankAccount = await BankInformation.create(bankData);

  res.status(201).json({
    success: true,
    message: 'Bank information created successfully',
    data: bankAccount
  });
});

// @desc    Update bank information
// @route   PUT /api/bank/:id
// @access  Admin
exports.updateBankInformation = asyncHandler(async (req, res) => {
  let bankAccount = await BankInformation.findById(req.params.id);

  if (!bankAccount) {
    return res.status(404).json({
      success: false,
      error: 'Bank information not found'
    });
  }

  // Add updater info
  req.body.updatedBy = req.user._id;

  // If setting as primary, handle the primary constraint
  if (req.body.isPrimary === true) {
    await BankInformation.updateMany(
      { _id: { $ne: req.params.id } },
      { isPrimary: false }
    );
  }

  bankAccount = await BankInformation.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('updatedBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'Bank information updated successfully',
    data: bankAccount
  });
});

// @desc    Delete bank information
// @route   DELETE /api/bank/:id
// @access  Admin
exports.deleteBankInformation = asyncHandler(async (req, res) => {
  const bankAccount = await BankInformation.findById(req.params.id);

  if (!bankAccount) {
    return res.status(404).json({
      success: false,
      error: 'Bank information not found'
    });
  }

  // Don't allow deleting the primary account if it's the only active one
  if (bankAccount.isPrimary) {
    const activeCount = await BankInformation.countDocuments({ 
      isActive: true, 
      _id: { $ne: req.params.id } 
    });
    
    if (activeCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete the primary account when it\'s the only active account'
      });
    }
  }

  await bankAccount.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Bank information deleted successfully'
  });
});

// @desc    Set primary bank account
// @route   PUT /api/bank/:id/primary
// @access  Admin
exports.setPrimaryBank = asyncHandler(async (req, res) => {
  const bankAccount = await BankInformation.findById(req.params.id);

  if (!bankAccount) {
    return res.status(404).json({
      success: false,
      error: 'Bank information not found'
    });
  }

  // Remove primary status from all other accounts
  await BankInformation.updateMany(
    { _id: { $ne: req.params.id } },
    { isPrimary: false }
  );

  // Set this account as primary and active
  bankAccount.isPrimary = true;
  bankAccount.isActive = true;
  bankAccount.updatedBy = req.user._id;
  await bankAccount.save();

  res.status(200).json({
    success: true,
    message: 'Primary bank account updated successfully',
    data: bankAccount
  });
});

// @desc    Get primary bank information (for public checkout)
// @route   GET /api/bank/primary
// @access  Public
exports.getPrimaryBankInformation = asyncHandler(async (req, res) => {
  const primaryBank = await BankInformation.findOne({ 
    isPrimary: true, 
    isActive: true 
  });

  if (!primaryBank) {
    return res.status(404).json({
      success: false,
      error: 'No primary bank account found'
    });
  }

  // Return limited information for public access
  const publicBankInfo = {
    _id: primaryBank._id,
    bankName: primaryBank.bankName,
    accountName: primaryBank.accountName,
    accountNumber: primaryBank.accountNumber,
    branch: primaryBank.branch,
    currency: primaryBank.currency,
    paymentInstructions: primaryBank.paymentInstructions,
    bankType: primaryBank.bankType,
    contactInfo: primaryBank.contactInfo
  };

  res.status(200).json({
    success: true,
    data: publicBankInfo
  });
}); 