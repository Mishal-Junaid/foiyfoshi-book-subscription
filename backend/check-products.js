const mongoose = require('mongoose');
const Product = require('./models/Product');

const checkProducts = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/foiyfoshi');
    console.log('Connected to MongoDB');
    
    const products = await Product.find({});
    console.log('\n=== Products in Database ===');
    
    if (products.length === 0) {
      console.log('No products found in database');
    } else {
      products.forEach(product => {
        console.log(`- ${product.name}: Stock ${product.stock}, Price: MVR ${product.price}`);
      });
    }
    
    console.log(`\nTotal products: ${products.length}`);
    
    // Check for products with 0 stock
    const outOfStock = products.filter(p => p.stock <= 0);
    if (outOfStock.length > 0) {
      console.log('\n=== Out of Stock Products ===');
      outOfStock.forEach(product => {
        console.log(`- ${product.name}: Stock ${product.stock}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkProducts(); 