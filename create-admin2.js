#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'https://foiyfoshi-backend.onrender.com';

async function createAdmin2() {
  try {
    console.log('🚀 Creating admin2@foiyfoshi.mv with admin role...');
    
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      name: 'FoiyFoshi Administrator 2',
      email: 'admin2@foiyfoshi.mv',
      password: 'admin123',
      phone: '+960-123-4568',
      role: 'admin',
      address: {
        street: 'Main Street',
        city: 'Malé',
        postalCode: '20026'
      }
    });
    
    console.log('📊 Registration response:', response.data);
    
    if (response.data.success && response.data.developmentInfo?.otp) {
      const otp = response.data.developmentInfo.otp;
      console.log('✅ Admin2 registered! OTP:', otp);
      
      // Auto-verify
      const verifyResponse = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email: 'admin2@foiyfoshi.mv',
        otp: otp
      });
      
      if (verifyResponse.data.success) {
        console.log('🎉 Admin2 verified!');
        
        // Test login
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
          email: 'admin2@foiyfoshi.mv',
          password: 'admin123'
        });
        
        console.log('📊 Login test:');
        console.log('Success:', loginResponse.data.success);
        console.log('Role:', loginResponse.data.user?.role);
        
        if (loginResponse.data.success && loginResponse.data.user?.role === 'admin') {
          console.log('\n🎉 PERFECT! Admin2 is working!');
          console.log('📧 Email: admin2@foiyfoshi.mv');
          console.log('🔑 Password: admin123');
          console.log('🌐 You can now login at: https://foiy-foshi.netlify.app/admin/login');
          console.log('');
          console.log('⚡ The original admin (admin@foiyfoshi.mv) has role "user"');
          console.log('⚡ Use admin2@foiyfoshi.mv for admin access');
        }
      }
    }
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

createAdmin2(); 