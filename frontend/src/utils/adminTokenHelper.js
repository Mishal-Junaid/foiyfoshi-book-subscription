/**
 * Helper functions for managing admin authentication in development mode
 * This allows easier testing of admin features without requiring a valid JWT
 */

/**
 * Creates a development admin token and stores it in localStorage
 * This is ONLY for development/testing purposes
 */
export const createDevAdminToken = () => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Dev admin token can only be used in development mode');
    return false;
  }
  
  // Generate a unique token with timestamp to avoid reuse
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 15);
  const token = `admin-fallback-token-${timestamp}-${randomString}`;
  // Store the token and admin email in localStorage
  // Always store token WITHOUT 'Bearer ' prefix - the api interceptor adds it
  localStorage.setItem('token', token);
  localStorage.setItem('adminEmail', 'admin@foiyfoshi.mv');
  localStorage.setItem('userRole', 'admin');
  
  console.log('Development admin token created:', token.substring(0, 20) + '...');
  return true;
};

/**
 * Checks if the current token is a development admin token
 */
export const isUsingDevAdminToken = () => {
  const token = localStorage.getItem('token');
  
  // Check if token includes the admin-fallback-token pattern, regardless of Bearer prefix
  const isAdmin = token && token.includes('admin-fallback-token-');
  
  if (isAdmin) {
    // Log the token format for debugging (truncated for security)
    const hasBearer = token.startsWith('Bearer ');
    console.log('Admin token found:', {
      tokenPrefix: token.substring(0, 15) + '...',
      hasBearer: hasBearer
    });
  }
  
  return isAdmin;
};

/**
 * Removes the development admin token
 */
export const clearDevAdminToken = () => {
  if (isUsingDevAdminToken()) {
    localStorage.removeItem('token');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('userRole');
    return true;
  }
  return false;
};

/**
 * Toggles between using a development admin token and no token
 */
export const toggleDevAdminToken = () => {
  if (isUsingDevAdminToken()) {
    return clearDevAdminToken();
  } else {
    return createDevAdminToken();
  }
};
