import api from './api';

// Get all content sections
export const getAllContent = async (active = true) => {
  try {
    const res = await api.get(`/content${active ? '?active=true' : ''}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
};

// Get content by section
export const getContentBySection = async (section) => {
  try {
    const res = await api.get(`/content/section/${section}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching content for section ${section}:`, error);
    throw error;
  }
};

// Create new content section
export const createContent = async (contentData) => {
  try {
    const res = await api.post('/content', contentData);
    return res.data;
  } catch (error) {
    console.error('Error creating content:', error);
    throw error;
  }
};

// Update existing content section
export const updateContent = async (id, contentData) => {
  try {
    const res = await api.put(`/content/${id}`, contentData);
    return res.data;
  } catch (error) {
    console.error(`Error updating content ${id}:`, error);
    throw error;
  }
};

// Delete content section
export const deleteContent = async (id) => {
  try {
    const res = await api.delete(`/content/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error deleting content ${id}:`, error);
    throw error;
  }
};

// Upload content images (file upload)
export const uploadContentImages = async (contentId, files, alt = '') => {
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
    
    const res = await api.post(`/content/${contentId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    console.error(`Error uploading images to content ${contentId}:`, error);
    throw error;
  }
};

// Add image to content (URL-based)
export const addContentImage = async (contentId, imageData) => {
  try {
    const res = await api.put(`/content/${contentId}/images`, imageData);
    return res.data;
  } catch (error) {
    console.error(`Error adding image to content ${contentId}:`, error);
    throw error;
  }
};

// Remove image from content
export const removeContentImage = async (contentId, imageId) => {
  try {
    const res = await api.delete(`/content/${contentId}/images/${imageId}`);
    return res.data;
  } catch (error) {
    console.error(`Error removing image from content ${contentId}:`, error);
    throw error;
  }
};

// Add link to content
export const addContentLink = async (contentId, linkData) => {
  try {
    const res = await api.put(`/content/${contentId}/links`, linkData);
    return res.data;
  } catch (error) {
    console.error(`Error adding link to content ${contentId}:`, error);
    throw error;
  }
};

// Remove link from content
export const removeContentLink = async (contentId, linkId) => {
  try {
    const res = await api.delete(`/content/${contentId}/links/${linkId}`);
    return res.data;
  } catch (error) {
    console.error(`Error removing link from content ${contentId}:`, error);
    throw error;
  }
};
