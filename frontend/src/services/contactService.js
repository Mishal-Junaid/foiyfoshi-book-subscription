import api from './api';

// Submit contact form
export const submitContactMessage = async (contactData) => {
  try {
    const response = await api.post('/contact', contactData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Admin functions for managing contact messages

// Get all contact messages (admin only)
export const getContactMessages = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.category) queryParams.append('category', params.category);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.search) queryParams.append('search', params.search);
    
    const response = await api.get(`/contact/messages?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get single contact message (admin only)
export const getContactMessage = async (id) => {
  try {
    const response = await api.get(`/contact/messages/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Reply to contact message (admin only)
export const replyToMessage = async (id, replyData) => {
  try {
    const response = await api.post(`/contact/messages/${id}/reply`, replyData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update message status (admin only)
export const updateMessageStatus = async (id, updateData) => {
  try {
    const response = await api.put(`/contact/messages/${id}/status`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete contact message (admin only)
export const deleteContactMessage = async (id) => {
  try {
    const response = await api.delete(`/contact/messages/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get contact statistics (admin only)
export const getContactStats = async () => {
  try {
    const response = await api.get('/contact/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}; 