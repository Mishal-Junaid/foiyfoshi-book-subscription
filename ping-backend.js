#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'https://foiyfoshi-backend.onrender.com';

async function pingBackend() {
  try {
    console.log('🔍 Testing backend connectivity...');
    console.log('📡 API URL:', API_URL);
    
    // Try a basic GET request first
    console.log('\n🌐 Testing basic connectivity...');
    const response = await axios.get(API_URL, {
      timeout: 10000,
      validateStatus: () => true // Accept any status code
    });
    
    console.log('📊 Response received!');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    
    if (response.status === 200) {
      console.log('✅ Backend is online and responding!');
    } else if (response.status === 502) {
      console.log('🚧 Backend is offline (502 Bad Gateway) - likely still deploying');
    } else {
      console.log('⚠️  Backend responded with status:', response.status);
    }
    
  } catch (error) {
    console.error('\n❌ Connection failed:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Connection refused - backend is not responding');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏰ Connection timed out - backend is not responding');
    } else {
      console.error('Error:', error.message);
    }
  }
}

pingBackend(); 