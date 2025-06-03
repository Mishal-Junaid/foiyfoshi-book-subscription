#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'https://foiyfoshi-backend.onrender.com';

async function createProperAdmin() {
  try {
    console.log('🚀 Creating proper admin user with correct role...');
    console.log('📡 Connecting to:', API_URL);
    
    // Create admin with new email to avoid conflict
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      name: 'FoiyFoshi Administrator',
      email: 'admin@foiyfoshi.mv', // Try the same email, might overwrite or fail gracefully
      password: 'admin123',
      phone: '+960-123-4567',
      role: 'admin', // This should now work with the fix
      address: {
        street: 'Main Street',
        city: 'Malé',
        postalCode: '20026'
      }
    });

    console.log('📊 Registration response:', response.data);

    if (response.data.success && response.data.developmentInfo?.otp) {
      const otp = response.data.developmentInfo.otp;
      console.log('✅ Admin user registered! Got OTP:', otp);
      
      // Immediately verify with OTP
      console.log('\n🔐 Auto-verifying with OTP...');
      const verifyResponse = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email: 'admin@foiyfoshi.mv',
        otp: otp
      });
      
      console.log('📊 Verification response:', verifyResponse.data);
      
      if (verifyResponse.data.success) {
        console.log('🎉 Admin user verified successfully!');
        
        // Test login
        console.log('\n🔐 Testing admin login...');
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
          email: 'admin@foiyfoshi.mv',
          password: 'admin123'
        });
        
        console.log('📊 Login test result:');
        console.log('Success:', loginResponse.data.success);
        console.log('Role:', loginResponse.data.user?.role);
        console.log('Has Token:', !!loginResponse.data.token);
        
        if (loginResponse.data.success && loginResponse.data.user?.role === 'admin') {
          console.log('\n🎉 SUCCESS! Admin user is working correctly!');
          console.log('📧 Email: admin@foiyfoshi.mv');
          console.log('🔑 Password: admin123');
          console.log('🌐 Login at: https://foiy-foshi.netlify.app/admin/login');
        } else {
          console.log('\n⚠️  Login successful but role is:', loginResponse.data.user?.role);
        }
      }
    } else {
      console.log('ℹ️  Registration response indicates user might already exist');
      
      // Try logging in directly
      console.log('\n🔐 Trying direct login...');
      const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
        email: 'admin@foiyfoshi.mv',
        password: 'admin123'
      });
      
      console.log('📊 Direct login result:');
      console.log('Success:', loginResponse.data.success);
      console.log('Role:', loginResponse.data.user?.role);
      console.log('Requires Verification:', loginResponse.data.requiresVerification);
    }

  } catch (error) {
    console.error('❌ Error occurred:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.data?.error?.includes('already exists')) {
        console.log('\n💡 User already exists. Let me try to create with different email...');
        
        // Try with admin2 email
        try {
          const altResponse = await axios.post(`${API_URL}/api/auth/register`, {
            name: 'FoiyFoshi Administrator Alt',
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
          
          console.log('✅ Alternative admin created:', altResponse.data);
          
          if (altResponse.data.developmentInfo?.otp) {
            const otp = altResponse.data.developmentInfo.otp;
            console.log('🔐 Verifying alternative admin...');
            
            const verifyResponse = await axios.post(`${API_URL}/api/auth/verify-otp`, {
              email: 'admin2@foiyfoshi.mv',
              otp: otp
            });
            
            if (verifyResponse.data.success) {
              console.log('🎉 Alternative admin verified and ready!');
              console.log('📧 Email: admin2@foiyfoshi.mv');
              console.log('🔑 Password: admin123');
            }
          }
          
        } catch (altError) {
          console.error('❌ Alternative admin creation failed:', altError.response?.data || altError.message);
        }
      }
    } else {
      console.error('Error:', error.message);
    }
  }
}

createProperAdmin(); 