#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'https://foiyfoshi-backend.onrender.com';

async function directVerifyAdmin() {
  try {
    console.log('🔧 Attempting to directly verify admin user...');
    
    // Method 1: Try to use the OTP verification with a fake OTP
    console.log('\n📧 Method 1: Using the OTP that was generated...');
    
    // First get the OTP by triggering login
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@foiyfoshi.mv',
      password: 'admin123'
    });
    
    if (loginResponse.data.developmentInfo && loginResponse.data.developmentInfo.otp) {
      const otp = loginResponse.data.developmentInfo.otp;
      console.log('📱 Got OTP:', otp);
      
      // Now try to verify with this OTP
      const verifyResponse = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email: 'admin@foiyfoshi.mv',
        otp: otp
      });
      
      console.log('✅ Verification Response:', verifyResponse.data);
      
      if (verifyResponse.data.success) {
        console.log('🎉 Admin user successfully verified!');
        
        // Test login again
        console.log('\n🔐 Testing login after verification...');
        const newLoginResponse = await axios.post(`${API_URL}/api/auth/login`, {
          email: 'admin@foiyfoshi.mv',
          password: 'admin123'
        });
        
        console.log('📊 Post-verification login:', {
          success: newLoginResponse.data.success,
          hasToken: !!newLoginResponse.data.token,
          hasUser: !!newLoginResponse.data.user,
          userRole: newLoginResponse.data.user?.role
        });
        
        return;
      }
    }
    
    console.log('❌ Method 1 failed, trying other approaches...');
    
    // Method 2: Try to create a new admin user that's already verified
    console.log('\n🔧 Method 2: Attempting to recreate admin with verification...');
    
    const recreateResponse = await axios.post(`${API_URL}/api/auth/register`, {
      name: 'FoiyFoshi Administrator',
      email: 'admin@foiyfoshi.mv',
      password: 'admin123',
      phone: '+960-123-4567',
      role: 'admin',
      address: {
        street: 'Main Street',
        city: 'Malé',
        island: 'Malé',
        postalCode: '20026'
      },
      forceVerified: true
    });
    
    console.log('📊 Recreate response:', recreateResponse.data);

  } catch (error) {
    console.error('\n❌ Error occurred:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received');
    } else {
      console.error('Error:', error.message);
    }
  }
}

directVerifyAdmin(); 