#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'https://foiyfoshi-backend.onrender.com';

async function checkAdminUser() {
  try {
    console.log('🔍 Checking admin user in production database...');
    console.log('📡 API URL:', API_URL);
    
    // First, test if the API is responding
    const healthCheck = await axios.get(`${API_URL}/api/health`).catch(() => null);
    if (!healthCheck) {
      console.log('⚠️  API health check failed - trying a basic endpoint...');
    }

    // Try to get user info without authentication
    console.log('\n🔍 Checking if admin user exists...');
    const userCheck = await axios.post(`${API_URL}/api/auth/check-user`, {
      email: 'admin@foiyfoshi.mv'
    }).catch(err => {
      console.log('ℹ️  User check endpoint not available:', err.response?.status);
      return null;
    });

    // Try admin login with detailed logging
    console.log('\n🔐 Attempting admin login...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@foiyfoshi.mv',
      password: 'admin123'
    });

    console.log('\n📊 Full Login Response:');
    console.log('Status:', loginResponse.status);
    console.log('Data:', JSON.stringify(loginResponse.data, null, 2));

    if (loginResponse.data.success) {
      console.log('✅ Admin login successful!');
      
      // Test accessing dashboard
      if (loginResponse.data.token) {
        console.log('\n🔒 Testing dashboard access...');
        const dashboardResponse = await axios.get(`${API_URL}/api/auth/dashboard-stats`, {
          headers: {
            'Authorization': `Bearer ${loginResponse.data.token}`
          }
        });
        console.log('✅ Dashboard access successful:', dashboardResponse.data);
      }
    } else {
      console.log('❌ Admin login failed');
      
      if (loginResponse.data.requiresVerification) {
        console.log('⚠️  Admin user exists but requires verification');
        console.log('💡 This should NOT happen with our bypass code!');
      }
    }

  } catch (error) {
    console.error('\n❌ Error occurred:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received');
      console.error('Request config:', error.config);
    } else {
      console.error('Error:', error.message);
    }
  }
}

checkAdminUser(); 