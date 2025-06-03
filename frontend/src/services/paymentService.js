/**
 * Payment Service
 * Handles payment-related operations and utilities
 */

import api from './api';

/**
 * Get the full URL for a receipt image
 * @param {string} filename - The receipt filename
 * @returns {string} - The full URL to the receipt image
 */
export const getReceiptUrl = (filename) => {
  if (!filename) return '';
  
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/receipts/${filename}`;
};

/**
 * Download a receipt file
 * @param {string} filename - The receipt filename
 * @param {string} orderNumber - The order number for naming the download
 */
export const downloadReceipt = (filename, orderNumber = '') => {
  if (!filename) return;
  
  const url = getReceiptUrl(filename);
  const link = document.createElement('a');
  link.href = url;
  link.download = `receipt-${orderNumber || 'order'}-${filename}`;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Validate receipt file before upload
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result with isValid and error message
 */
export const validateReceiptFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
  
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File must be an image (JPEG, PNG, GIF) or PDF' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Get pending payments for admin verification
 * @returns {Promise} - API response with pending payments
 */
export const getPendingPayments = async () => {
  try {
    const response = await api.get('/orders?paymentStatus=pending_verification');
    return {
      success: true,
      data: response.data.orders || response.data
    };
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    throw error;
  }
};

/**
 * Approve a payment
 * @param {string} orderId - The order ID
 * @returns {Promise} - API response
 */
export const approvePayment = async (orderId) => {
  try {
    const response = await api.put(`/orders/${orderId}/payment-status`, {
      paymentStatus: 'verified'
    });
    return response.data;
  } catch (error) {
    console.error('Error approving payment:', error);
    throw error;
  }
};

/**
 * Reject a payment
 * @param {string} orderId - The order ID
 * @param {string} reason - Reason for rejection
 * @returns {Promise} - API response
 */
export const rejectPayment = async (orderId, reason = '') => {
  try {
    const response = await api.put(`/orders/${orderId}/payment-status`, {
      paymentStatus: 'rejected',
      rejectionReason: reason
    });
    return response.data;
  } catch (error) {
    console.error('Error rejecting payment:', error);
    throw error;
  }
};

const paymentService = {
  getReceiptUrl,
  downloadReceipt,
  validateReceiptFile,
  getPendingPayments,
  approvePayment,
  rejectPayment
};

export default paymentService; 