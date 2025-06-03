import api from './api';

// Development helper - Create admin user
export const createDevAdmin = async () => {
  try {
    const response = await api.post('/auth/create-dev-admin');
    
    if (response.data.success && response.data.token) {
      // Store the token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      console.log('✅ Development admin created and logged in');
      console.log('📧 Email: admin@foiyfoshi.mv');
      console.log('🔑 Password: admin123');
      
      return response.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error creating dev admin:', error);
    throw error;
  }
}; 