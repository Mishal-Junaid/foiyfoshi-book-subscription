const mongoose = require('mongoose');

// Simple in-memory storage for development when MongoDB is not available
let inMemoryData = {
  users: [],
  products: [],
  orders: [],
  content: []
};

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;
    
    // If no MONGO_URI is provided, try to use a free MongoDB Atlas cluster or fallback
    if (!mongoUri) {
      console.log('No MONGO_URI provided. Attempting to connect to development database...');
      
      // Try a few different connection strings
      const fallbackUris = [
        'mongodb://127.0.0.1:27017/foiyfoshi-dev',
        'mongodb://localhost:27017/foiyfoshi-dev'
      ];
      
      let connected = false;
      for (const uri of fallbackUris) {
        try {
          console.log(`Trying to connect to: ${uri}`);
          const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 3000, // 3 second timeout
            socketTimeoutMS: 45000,
          });
          console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
          connected = true;
          break;
        } catch (err) {
          console.log(`Failed to connect to ${uri}: ${err.message}`);
        }
      }
      
      if (!connected) {
        console.log('⚠️  Could not connect to any MongoDB instance');
        console.log('⚠️  The application will run but data will not persist');
        console.log('⚠️  For production, please provide a MONGO_URI environment variable');
        
        // Set up mongoose to work without a real connection
        // This allows the app to run but data won't persist
        mongoose.connection.readyState = 1; // Connected state
        return;
      }
    } else {
      // Use provided MONGO_URI
      const conn = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    console.log('⚠️  Starting without persistent database');
    console.log('⚠️  Data will not be saved between server restarts');
    
    // Allow the app to continue running
    mongoose.connection.readyState = 1;
  }
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB disconnected');
    }
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error.message);
  }
};

// Export both functions and in-memory data for fallback
module.exports = { connectDB, disconnectDB, inMemoryData };
