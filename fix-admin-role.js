#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'https://foiyfoshi-backend.onrender.com';

async function fixAdminRole() {
  try {
    console.log('🔧 Fixing admin user role...');
    
    // First login to get token
    console.log('\n🔐 Logging in to get admin token...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@foiyfoshi.mv',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed');
      return;
    }

    const token = loginResponse.data.token;
    const userId = loginResponse.data.user._id;
    
    console.log('✅ Successfully logged in');
    console.log('📋 User ID:', userId);
    console.log('🔑 Current role:', loginResponse.data.user.role);
    
    // Now try to update the role - this might not work if there's no admin endpoint
    // But let's try a few approaches
    
    console.log('\n🔄 Attempting to update role...');
    
    // Method 1: Try updating via profile update
    try {
      const updateResponse = await axios.put(`${API_URL}/api/auth/updatedetails`, {
        name: 'FoiyFoshi Administrator',
        email: 'admin@foiyfoshi.mv',
        phone: '+960-123-4567',
        role: 'admin', // Try to include role
        address: {
          street: 'Main Street',
          city: 'Malé',
          postalCode: '20026'
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 Update response:', updateResponse.data);
      
    } catch (updateError) {
      console.log('⚠️  Profile update failed:', updateError.response?.data || updateError.message);
    }
    
    // Method 2: Check if there's an admin endpoint
    try {
      const adminResponse = await axios.get(`${API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Admin endpoint accessible!');
      
    } catch (adminError) {
      console.log('⚠️  Admin endpoint not accessible:', adminError.response?.status);
    }
    
    // Method 3: Test final login to see current status
    console.log('\n🔍 Testing final login status...');
    const finalLogin = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@foiyfoshi.mv',
      password: 'admin123'
    });
    
    console.log('📊 Final login result:');
    console.log('Success:', finalLogin.data.success);
    console.log('Role:', finalLogin.data.user?.role);
    console.log('Is Verified:', finalLogin.data.user?.isVerified);
    
    if (finalLogin.data.success && finalLogin.data.user?.role === 'admin') {
      console.log('\n🎉 SUCCESS! Admin user now has correct role!');
    } else if (finalLogin.data.success) {
      console.log('\n⚠️  User can login but role is still:', finalLogin.data.user?.role);
      console.log('💡 You may need to manually update the database or create a proper admin user');
    }

  } catch (error) {
    console.error('\n❌ Error occurred:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

fixAdminRole(); 