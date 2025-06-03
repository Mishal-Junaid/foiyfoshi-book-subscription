#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'https://foiyfoshi-backend.onrender.com';

async function testAdmin2Login() {
  try {
    console.log('🔍 Testing admin2 login...');
    console.log('📡 API URL:', API_URL);
    
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin2@foiyfoshi.mv',
      password: 'admin123'
    });

    console.log('✅ Login successful!');
    console.log('📊 Response:', {
      success: response.data.success,
      hasToken: !!response.data.token,
      hasUser: !!response.data.user,
      userRole: response.data.user?.role,
      userEmail: response.data.user?.email,
      isVerified: response.data.user?.isVerified
    });

    if (response.data.token) {
      console.log('🔑 Token received (first 20 chars):', response.data.token.substring(0, 20) + '...');
      
      // Test accessing dashboard
      console.log('\n🔒 Testing admin dashboard access...');
      
      const dashboardResponse = await axios.get(`${API_URL}/api/auth/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${response.data.token}`
        }
      });
      
      console.log('✅ Dashboard access successful!');
      console.log('📊 Dashboard data:', dashboardResponse.data);
      
      console.log('\n🎉 SUCCESS! Admin2 login is working perfectly!');
      console.log('📧 Email: admin2@foiyfoshi.mv');
      console.log('🔑 Password: admin123');
      console.log('🌐 Login at: https://foiy-foshi.netlify.app/admin/login');
    }

  } catch (error) {
    console.error('❌ Login failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
      
      if (error.response.data?.requiresVerification) {
        console.log('\n⚠️  Admin2 requires verification!');
        
        if (error.response.data.developmentInfo?.otp) {
          const otp = error.response.data.developmentInfo.otp;
          console.log('🔐 Got OTP:', otp, '- attempting verification...');
          
          try {
            const verifyResponse = await axios.post(`${API_URL}/api/auth/verify-otp`, {
              email: 'admin2@foiyfoshi.mv',
              otp: otp
            });
            
            if (verifyResponse.data.success) {
              console.log('✅ Verification successful! Trying login again...');
              
              // Try login again after verification
              const loginResponse2 = await axios.post(`${API_URL}/api/auth/login`, {
                email: 'admin2@foiyfoshi.mv',
                password: 'admin123'
              });
              
              console.log('🎉 Login after verification successful!');
              console.log('📊 Final result:', {
                success: loginResponse2.data.success,
                hasToken: !!loginResponse2.data.token,
                userRole: loginResponse2.data.user?.role
              });
            }
          } catch (verifyError) {
            console.error('❌ Verification failed:', verifyError.response?.data || verifyError.message);
          }
        }
      }
    } else if (error.request) {
      console.error('No response received from server');
      console.error('This might indicate CORS issues or server downtime');
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAdmin2Login(); 