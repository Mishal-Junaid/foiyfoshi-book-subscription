import api from './api';

// Get user's wishlist
export const getWishlist = async () => {
  try {
    const response = await api.get('/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

// Add product to wishlist
export const addToWishlist = async (productId) => {
  try {
    const response = await api.post('/wishlist', { productId });
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (productId) => {
  try {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

// Check if product is in wishlist
export const isInWishlist = async (productId) => {
  try {
    const response = await api.get(`/wishlist/check/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    // Return false if there's an error (user not logged in, etc.)
    return { data: { isInWishlist: false } };
  }
};

// Clear entire wishlist
export const clearWishlist = async () => {
  try {
    const response = await api.delete('/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    throw error;
  }
}; 