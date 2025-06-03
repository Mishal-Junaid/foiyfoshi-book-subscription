import api from './api';

// Get all products
export const getProducts = async (params = {}) => {
  try {
    const res = await api.get('/products', { params });
    return res.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get single product by ID
export const getProductById = async (id) => {
  try {
    const res = await api.get(`/products/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

// Get featured products
export const getFeaturedProducts = async (limit = 5) => {
  try {
    const res = await api.get(`/products/featured?limit=${limit}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

// Get current month's subscription box
export const getCurrentBox = async () => {
  try {
    const res = await api.get(`/products/current-box`);
    return res.data;
  } catch (error) {
    console.error('Error fetching current box:', error);
    throw error;
  }
};

// Create new product
export const createProduct = async (productData) => {
  try {
    const res = await api.post('/products', productData);
    return res.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Update product
export const updateProduct = async (id, productData) => {
  try {
    const res = await api.put(`/products/${id}`, productData);
    return res.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};

// Upload product images (file upload)
export const uploadProductImages = async (productId, files, alt = '') => {
  try {
    const formData = new FormData();
    
    // Add files to form data
    if (Array.isArray(files)) {
      files.forEach(file => {
        formData.append('images', file);
      });
    } else {
      formData.append('images', files);
    }
    
    // Add alt text if provided
    if (alt) {
      formData.append('alt', alt);
    }
    
    const res = await api.post(`/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    console.error(`Error uploading images to product ${productId}:`, error);
    throw error;
  }
};

// Delete product image
export const deleteProductImage = async (productId, imageId) => {
  try {
    const res = await api.delete(`/products/${productId}/images/${imageId}`);
    return res.data;
  } catch (error) {
    console.error(`Error deleting image ${imageId} from product ${productId}:`, error);
    throw error;
  }
};

// Set product as current box
export const setCurrentBox = async (productId) => {
  try {
    const res = await api.put(`/products/${productId}/set-current`);
    return res.data;
  } catch (error) {
    console.error(`Error setting product ${productId} as current box:`, error);
    throw error;
  }
};
