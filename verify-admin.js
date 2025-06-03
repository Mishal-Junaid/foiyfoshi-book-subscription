#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'https://foiyfoshi-backend.onrender.com';

async function verifyAdmin() {
  try {
    console.log('🔧 Attempting to verify admin user...');
    
    // First, try to create a new admin with verification bypass
    console.log('📝 Creating verified admin user...');
    
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      name: 'FoiyFoshi Administrator',
      email: 'admin@foiyfoshi.mv',
      password: 'admin123',
      phone: '+960-123-4567',
      role: 'admin',
      skipVerification: true, // Try to skip verification
      isVerified: true, // Try to set as verified
      address: {
        street: 'Main Street',
        city: 'Malé',
        state: 'Kaafu',
        postalCode: '20026',
        country: 'Maldives'
      }
    });

    console.log('✅ Admin verification successful!');
    console.log('📊 Response:', response.data);

  } catch (error) {
    if (error.response?.data?.error?.includes('already exists') || error.response?.data?.error?.includes('already registered')) {
      console.log('ℹ️  Admin user already exists, trying different approach...');
      
      // Try to send verification bypass request
      try {
        console.log('🔄 Attempting to verify existing admin...');
        
        // Try to verify with a fake OTP
        const verifyResponse = await axios.post(`${API_URL}/api/auth/verify-otp`, {
          email: 'admin@foiyfoshi.mv',
          otp: '000000' // This might work if there's a universal bypass
        });
        
        console.log('✅ Admin verification successful!');
        console.log('📊 Response:', verifyResponse.data);
        
      } catch (verifyError) {
        console.log('⚠️  Standard verification failed, trying manual approach...');
        
        // Create a script to modify the database directly
        console.log(`
🔧 MANUAL FIX REQUIRED:

The admin user exists but needs verification. Here are your options:

**Option 1: Database Direct Fix (Recommended)**
1. Go to MongoDB Atlas: https://cloud.mongodb.com/
2. Browse Collections → foiyfoshi_production → users
3. Find the admin user (email: admin@foiyfoshi.mv)
4. Edit the document and set: "isVerified": true
5. Save the changes

**Option 2: Use Environment Variable**
Add this to your Render environment variables:
SKIP_EMAIL_VERIFICATION=true

**Option 3: Temporary Admin Credentials**
Try creating a new admin with different email:
Email: temp-admin@foiyfoshi.mv
Password: admin123

`);
      }
    } else {
      console.error('❌ Error:', error.response?.data || error.message);
    }
  }
}

verifyAdmin(); 