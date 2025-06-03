import axios from 'axios';
import environment from '../config/environment';

const API_URL = environment.API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Add admin fallback headers if using fallback token
      if (token.includes('admin-fallback-token-')) {
        config.headers['x-admin-override'] = 'true';
        config.headers['admin-email'] = 'admin@foiyfoshi.mv';
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export both as default and named export for compatibility
export { api };
export default api;
