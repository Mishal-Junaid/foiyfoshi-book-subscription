const fs = require('fs');
const path = require('path');

// Create required directories if they don't exist
const setupDirectories = () => {
  const directories = [
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../uploads/products'),
    path.join(__dirname, '../uploads/content'),
    path.join(__dirname, '../uploads/receipts'),
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  console.log('Directory setup complete.');
};

module.exports = setupDirectories;
