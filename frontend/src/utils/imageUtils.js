/**
 * Utility functions for handling image URLs in the FoiyFoshi app
 */

// Function to handle image loading errors
export const handleImageError = (event) => {
  // Replace broken image with a placeholder div
  const img = event.target;
  const parent = img.parentNode;
  
  // Create placeholder div
  const placeholder = document.createElement('div');
  placeholder.className = 'image-placeholder';
  placeholder.style.cssText = `
    width: 100%;
    height: 100%;
    min-height: 200px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    border-radius: 8px;
    border: 2px dashed #ddd;
  `;
  
  // Add content to placeholder
  const content = document.createElement('div');
  content.style.cssText = 'text-align: center; color: #666;';
  const title = document.createElement('h3');
  title.textContent = 'FoiyFoshi';
  title.style.cssText = 'margin: 0 0 8px 0; font-size: 1.2rem;';
  const text = document.createElement('p');
  text.textContent = 'Image coming soon';
  text.style.cssText = 'margin: 0; font-size: 0.9rem;';
  
  content.appendChild(title);
  content.appendChild(text);
  placeholder.appendChild(content);
  
  // Replace img with placeholder
  if (parent) {
    parent.replaceChild(placeholder, img);
  }
};

// Simple, reliable placeholder image (1x1 transparent pixel)
const PLACEHOLDER_DATA_URI = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// Simple prop to handle image errors with a fallback image
export const imgErrorProps = {
  onError: (e) => {
    e.target.src = PLACEHOLDER_DATA_URI;
    e.target.onerror = null; // prevents looping
  }
};

/**
 * Process an image URL to ensure it's in the correct format
 * @param {string} url - The image URL to process
 * @param {string} fallback - Optional fallback URL if the provided URL is empty
 * @returns {string} - The processed URL
 */
export const getImageUrl = (url, fallback = PLACEHOLDER_DATA_URI) => {
  // Handle null, undefined, or non-string values
  if (!url) {
    console.log('No URL provided, using fallback:', fallback);
    return fallback;
  }
  
  // Ensure url is a string
  if (typeof url !== 'string') {
    console.warn('Non-string value passed to getImageUrl:', url);
    return fallback;
  }
  
  // Clean the URL
  const cleanUrl = url.trim();
  
  // Debug logging to see what URLs we're getting
  console.log('Processing image URL:', cleanUrl);
  
  // If it's already a full URL (http/https), use it as is
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    console.log('Full URL detected:', cleanUrl);
    return cleanUrl;
  }
  
  // If it's a data URI, validate it's properly formatted
  if (cleanUrl.startsWith('data:')) {
    // Check if it's a valid data URI format
    if (cleanUrl.includes('base64,') && cleanUrl.length > 20) {
      console.log('Valid data URI detected');
      return cleanUrl;
    } else {
      console.warn('Invalid data URI detected, using fallback');
      return fallback;
    }
  }
  
  // Handle client-side images that should be in the public folder
  if (cleanUrl.startsWith('/images/') || cleanUrl.startsWith('images/')) {
    const imagePath = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
    console.log('Client-side image path:', imagePath);
    return imagePath;
  }
  
  // Handle server uploads correctly
  if (cleanUrl.startsWith('/uploads/')) {
    // For server-side uploads, use full backend URL since proxy isn't working
    const fullUrl = `http://localhost:5000${cleanUrl}`;
    console.log('Server upload detected, using full backend URL:', fullUrl);
    return fullUrl;
  }
  
  // If it starts with a slash, use it as is (absolute path)
  if (cleanUrl.startsWith('/')) {
    console.log('Absolute path:', cleanUrl);
    return cleanUrl;
  }
  
  // Handle simple filenames that might be backend uploads
  // Check if it looks like a filename (contains a dot and no slashes)
  if (cleanUrl.includes('.') && !cleanUrl.includes('/') && cleanUrl.length < 200) {
    // This might be a filename that should be treated as a backend upload
    const backendUrl = `http://localhost:5000/uploads/content/${cleanUrl}`;
    console.log('Simple filename detected, treating as backend upload:', backendUrl);
    return backendUrl;
  }
  
  // If it's not a valid format, use fallback
  console.warn('Unrecognized URL format, using fallback:', cleanUrl);
  return fallback;
};

/**
 * Get a URL from an image object or default to a fallback
 * @param {Object} imageObj - The image object which may contain a url property
 * @param {string} fallback - Optional fallback URL
 * @returns {string} - The processed URL
 */
export const getImageObjUrl = (imageObj, fallback = PLACEHOLDER_DATA_URI) => {
  if (!imageObj || !imageObj.url) return fallback;
  return getImageUrl(imageObj.url, fallback);
};

// React component props for applying the error handler to all images
export const imgComponentErrorProps = {
  onError: handleImageError,
};

/**
 * Usage:
 * 
 * Method 1: Using onError directly
 * <img src={imageUrl} onError={handleImageError} alt="Product" />
 * 
 * Method 2: Using spread operator with imgErrorProps
 * <img src={imageUrl} {...imgErrorProps} alt="Product" />
 */
