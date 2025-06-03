import api from './api';

/**
 * Send payment verification notification email to customer
 * @param {string} orderId - The order ID
 * @param {string} status - The payment verification status ('verified' or 'rejected')
 * @param {string} reason - Optional rejection reason
 * @returns {Promise} - The response from the API
 */
export const sendPaymentNotification = async (orderId, status, reason = '') => {
  try {
    const res = await api.post(
      `/api/payments/notification/${orderId}`,
      { 
        status,
        reason // Include rejection reason if provided
      }
    );
    return res.data;
  } catch (error) {
    console.error('Error sending payment notification:', error);
    throw error;
  }
};

/**
 * Send order confirmation email to customer
 * @param {string} orderId - The order ID
 * @returns {Promise} - The response from the API
 */
export const sendOrderConfirmation = async (orderId) => {
  try {
    const res = await api.post(
      `/api/orders/confirmation/${orderId}`,
      {}
    );
    return res.data;
  } catch (error) {
    console.error('Error sending order confirmation:', error);
    throw error;
  }
};

/**
 * Send shipping notification email to customer
 * @param {string} orderId - The order ID
 * @param {Object} shippingDetails - The shipping details (tracking number, carrier, etc.)
 * @returns {Promise} - The response from the API
 */
export const sendShippingNotification = async (orderId, shippingDetails) => {
  try {
    const res = await api.post(
      `/api/orders/shipping-notification/${orderId}`,
      shippingDetails
    );
    return res.data;
  } catch (error) {
    console.error('Error sending shipping notification:', error);
    throw error;
  }
};

/**
 * Send delivery confirmation email to customer
 * @param {string} orderId - The order ID
 * @returns {Promise} - The response from the API
 */
export const sendDeliveryConfirmation = async (orderId) => {
  try {
    const res = await api.post(
      `/api/orders/delivery-confirmation/${orderId}`,
      {}
    );
    return res.data;
  } catch (error) {
    console.error('Error sending delivery confirmation:', error);
    throw error;
  }
};

/**
 * Send payment receipt pending notification to customer
 * @param {string} orderId - The order ID
 * @returns {Promise} - The response from the API
 */
export const sendPaymentPendingNotification = async (orderId) => {
  try {
    const res = await api.post(
      `/api/payments/pending-notification/${orderId}`,
      {}
    );
    return res.data;
  } catch (error) {
    console.error('Error sending payment pending notification:', error);
    throw error;
  }
};
