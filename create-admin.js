#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'https://foiyfoshi-backend.onrender.com';

async function createAdmin() {
  try {
    console.log('🚀 Creating admin user in production database...');
    console.log('📡 Connecting to:', API_URL);
    
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      name: 'FoiyFoshi Administrator',
      email: 'admin@foiyfoshi.mv',
      password: 'admin123',
      phone: '+960-123-4567',
      role: 'admin',
      address: {
        street: 'Main Street',
        city: 'Malé',
        state: 'Kaafu',
        postalCode: '20026',
        country: 'Maldives'
      }
    });

    if (response.data.success) {
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@foiyfoshi.mv');
      console.log('🔑 Password: admin123');
      console.log('');
      console.log('🌐 Now you can login at: https://foiy-foshi.netlify.app/admin/login');
    } else {
      console.log('ℹ️  Response:', response.data);
    }

  } catch (error) {
    if (error.response?.data?.error?.includes('already exists')) {
      console.log('ℹ️  Admin user already exists!');
      console.log('📧 Email: admin@foiyfoshi.mv');
      console.log('🔑 Password: admin123');
      console.log('');
      console.log('🌐 Try logging in at: https://foiy-foshi.netlify.app/admin/login');
    } else if (error.response?.data?.error?.includes('requires verification')) {
      console.log('⚠️  Admin created but needs verification.');
      console.log('📧 Check email for OTP, or manually verify in database.');
    } else {
      console.error('❌ Error creating admin:', error.response?.data || error.message);
      
      // Try alternative approach - directly create admin via special endpoint
      try {
        console.log('🔄 Trying alternative admin creation method...');
        const altResponse = await axios.post(`${API_URL}/api/auth/create-dev-admin`);
        
        if (altResponse.data.success) {
          console.log('✅ Admin user created via development endpoint!');
          console.log('📧 Email: admin@foiyfoshi.mv');
          console.log('🔑 Password: admin123');
        } else {
          console.log('ℹ️  Alternative response:', altResponse.data);
        }
      } catch (altError) {
        console.error('❌ Alternative method also failed:', altError.response?.data || altError.message);
      }
    }
  }
}

createAdmin(); 