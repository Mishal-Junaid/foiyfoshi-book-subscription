import api from './api';

/**
 * Subscribe to newsletter
 * @param {string} email - Email address to subscribe
 * @returns {Promise} - The response from the API
 */
export const subscribeToNewsletter = async (email) => {
  try {
    const res = await api.post('/newsletter/subscribe', { email });
    return res.data;
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    throw error;
  }
};

/**
 * Unsubscribe from newsletter
 * @param {string} email - Email address to unsubscribe
 * @returns {Promise} - The response from the API
 */
export const unsubscribeFromNewsletter = async (email) => {
  try {
    const res = await api.post('/newsletter/unsubscribe', { email });
    return res.data;
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    throw error;
  }
};

/**
 * Get all newsletter subscribers (Admin only)
 * @param {Object} params - Query parameters (page, limit, status)
 * @returns {Promise} - The response from the API
 */
export const getNewsletterSubscribers = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const res = await api.get(`/newsletter/subscribers?${queryString}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    throw error;
  }
};

/**
 * Send newsletter to all active subscribers (Admin only)
 * @param {Object} newsletterData - Newsletter content
 * @param {string} newsletterData.subject - Email subject
 * @param {string} newsletterData.content - Plain text content
 * @param {string} newsletterData.htmlContent - HTML content
 * @returns {Promise} - The response from the API
 */
export const sendNewsletter = async (newsletterData) => {
  try {
    const res = await api.post('/newsletter/send', newsletterData);
    return res.data;
  } catch (error) {
    console.error('Error sending newsletter:', error);
    throw error;
  }
};

/**
 * Add subscriber manually (Admin only)
 * @param {string} email - Email address to add
 * @returns {Promise} - The response from the API
 */
export const addNewsletterSubscriber = async (email) => {
  try {
    const res = await api.post('/newsletter/subscribers', { email });
    return res.data;
  } catch (error) {
    console.error('Error adding subscriber:', error);
    throw error;
  }
};

/**
 * Delete subscriber (Admin only)
 * @param {string} subscriberId - Subscriber ID to delete
 * @returns {Promise} - The response from the API
 */
export const deleteNewsletterSubscriber = async (subscriberId) => {
  try {
    const res = await api.delete(`/newsletter/subscribers/${subscriberId}`);
    return res.data;
  } catch (error) {
    console.error('Error removing subscriber:', error);
    throw error;
  }
}; 