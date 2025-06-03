import api from './api';

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user's orders
export const getMyOrders = async () => {
  try {
    const response = await api.get('/orders/myorders');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get single order
export const getOrder = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin: Get all orders
export const getAllOrders = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/orders${queryString ? `?${queryString}` : ''}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin: Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin: Update payment status
export const updatePaymentStatus = async (orderId, isPaid) => {
  try {
    const response = await api.put(`/orders/${orderId}/payment`, { isPaid });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin: Update tracking number
export const updateTrackingNumber = async (orderId, trackingNumber) => {
  try {
    const response = await api.put(`/orders/${orderId}/tracking`, { trackingNumber });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin: Delete order
export const deleteOrder = async (orderId) => {
  try {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get order statistics
export const getOrderStats = async () => {
  try {
    const response = await api.get('/orders/stats');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Upload payment receipt
export const uploadReceipt = async (orderId, receiptFile) => {
  try {
    const formData = new FormData();
    formData.append('receipt', receiptFile);
    
    const response = await api.post(`/orders/${orderId}/receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  updateTrackingNumber,
  deleteOrder,
  getOrderStats,
  uploadReceipt,
};
