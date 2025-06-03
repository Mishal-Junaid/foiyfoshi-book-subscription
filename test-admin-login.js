#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'https://foiyfoshi-backend.onrender.com';

async function testAdminLogin() {
  try {
    console.log('🔍 Testing admin login against production API...');
    console.log('📡 API URL:', API_URL);
    
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@foiyfoshi.mv',
      password: 'admin123'
    });

    console.log('✅ Login successful!');
    console.log('📊 Response:', {
      success: response.data.success,
      hasToken: !!response.data.token,
      hasUser: !!response.data.user,
      userRole: response.data.user?.role,
      userEmail: response.data.user?.email,
      requiresVerification: response.data.requiresVerification
    });

    if (response.data.token) {
      console.log('🔑 Token received (first 20 chars):', response.data.token.substring(0, 20) + '...');
    }

    // Test accessing an admin endpoint with the token
    if (response.data.token) {
      console.log('\n🔒 Testing admin dashboard access...');
      
      const dashboardResponse = await axios.get(`${API_URL}/api/auth/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${response.data.token}`
        }
      });
      
      console.log('✅ Dashboard access successful!');
      console.log('📊 Dashboard data:', dashboardResponse.data);
    }

  } catch (error) {
    console.error('❌ Login failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
      
      if (error.response.data?.error?.includes('verification')) {
        console.log('\n⚠️  The admin user might need email verification!');
        console.log('💡 You may need to manually verify the admin user in the database.');
      }
    } else if (error.request) {
      console.error('No response received from server');
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAdminLogin(); 