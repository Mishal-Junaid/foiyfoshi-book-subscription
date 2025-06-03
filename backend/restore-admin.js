const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const restoreAdmin = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/foiyfoshi');
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@foiyfoshi.mv' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@foiyfoshi.mv',
      password: hashedPassword,
      phone: '+9607777777',
      role: 'admin',
      isVerified: true,
      address: {
        street: 'Main Street',
        city: 'Malé',
        island: 'Malé',
        postalCode: '20095'
      }
    });
    
    console.log('Admin user created successfully');
    console.log('Email: admin@foiyfoshi.mv');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

restoreAdmin(); 