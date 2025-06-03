const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Load models
const User = require('./models/User');
const Product = require('./models/Product');
const Content = require('./models/Content');

// Load env vars
dotenv.config();

let mongod;

// Connect to DB with fallback to Memory Server
const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;
    
    // If no MONGO_URI is provided or if we're in development and can't connect to local MongoDB
    if (!mongoUri || (process.env.NODE_ENV === 'development' && mongoUri.includes('localhost'))) {
      console.log('Starting MongoDB Memory Server for seeding...');
      mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log('MongoDB Memory Server started at:', mongoUri);
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    
    // If connection fails and we're in development, try MongoDB Memory Server
    if (process.env.NODE_ENV === 'development' && !mongod) {
      try {
        console.log('Local MongoDB connection failed, starting MongoDB Memory Server...');
        mongod = await MongoMemoryServer.create();
        const mongoUri = mongod.getUri();
        console.log('MongoDB Memory Server started at:', mongoUri);
        
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected for seeding');
      } catch (memoryServerError) {
        console.error(`MongoDB Memory Server Error: ${memoryServerError.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

// Admin user data
const adminUser = {
  name: 'Admin User',
  email: 'admin@foiyfoshi.mv',
  password: 'admin123',
  phone: '+9607777777',
  role: 'admin',
  isVerified: true,
  address: {
    street: 'Main Street',
    city: 'Malé',
    island: 'Malé',
    postalCode: '20095'
  }
};

// Sample product data
const sampleProducts = [
  {
    name: 'May 2025 Subscription Box',
    description: 'Our May 2025 box features a curated selection of books that explore the rich culture and history of the Maldives, along with some surprise items that will enhance your reading experience.',
    price: 399,
    images: [
      {
        url: '/uploads/products/product-1.jpg',
        alt: 'May 2025 Subscription Box'
      }
    ],
    isFeatured: true,
    isCurrentBox: true,
    category: 'Monthly Box',
    theme: 'Maldivian Culture',
    itemsIncluded: [
      {
        name: 'The Coral Islands',
        description: 'A mesmerizing novel about life in the Maldives'
      },
      {
        name: 'Ocean Whispers',
        description: 'Poetry collection inspired by the sea'
      },
      {
        name: 'Custom Bookmark',
        description: 'Handcrafted bookmark with Maldivian motifs'
      },
      {
        name: 'Tea Collection',
        description: 'Selection of premium teas to enjoy while reading'
      }
    ],
    stock: 50,
    releaseDate: new Date()
  },
  {
    name: 'Fiction Lovers Box',
    description: 'A special box curated for fiction enthusiasts, featuring bestselling novels from various genres.',
    price: 449,
    images: [
      {
        url: '/uploads/products/product-2.jpg',
        alt: 'Fiction Lovers Box'
      }
    ],
    isFeatured: true,
    isCurrentBox: false,
    category: 'Special Edition',
    theme: 'Fiction',
    itemsIncluded: [
      {
        name: 'Mystery Novel',
        description: 'A thrilling whodunit that will keep you guessing'
      },
      {
        name: 'Science Fiction Epic',
        description: 'A journey to worlds beyond imagination'
      },
      {
        name: 'Reading Light',
        description: 'Compact reading light for nighttime reading'
      },
      {
        name: 'Character Notebook',
        description: 'For keeping track of your favorite characters'
      }
    ],
    stock: 30,
    releaseDate: new Date()
  },
  {
    name: 'Children\'s Adventure Box',
    description: 'A delightful collection of children\'s books focused on adventure and discovery, perfect for young readers.',
    price: 299,
    images: [
      {
        url: '/uploads/products/product-3.jpg',
        alt: 'Children\'s Adventure Box'
      }
    ],
    isFeatured: true,
    isCurrentBox: false,
    category: 'Children',
    theme: 'Adventure',
    itemsIncluded: [
      {
        name: 'The Island Explorer',
        description: 'An illustrated adventure story for children'
      },
      {
        name: 'Ocean Friends',
        description: 'A picture book about marine life'
      },
      {
        name: 'Coloring Set',
        description: 'Ocean-themed coloring book and crayons'
      },
      {
        name: 'Plush Dolphin',
        description: 'A cuddly reading companion'
      }
    ],
    stock: 40,
    releaseDate: new Date()
  }
];

// Sample content data
const sampleContent = [
  {
    section: 'hero',
    title: 'Discover the Joy of Reading with FoiyFoshi',
    subtitle: 'The Maldives\' First Book Subscription Box',
    content: 'Every month, receive a curated selection of books and reading accessories delivered straight to your door.',
    images: [
      {
        url: '/assets/images/hero-image.jpg',
        alt: 'FoiyFoshi Subscription Box'
      }
    ],
    links: [
      {
        url: '/products',
        text: 'Explore Our Boxes'
      }
    ],
    active: true,
    order: 1
  },
  {
    section: 'about',
    title: 'About FoiyFoshi',
    subtitle: 'Our Story',
    content: 'FoiyFoshi was born from a passion for reading and a desire to share the joy of books with fellow Maldivians. Our mission is to foster a community of book lovers across the islands by providing access to quality reading materials and creating a shared reading experience.',
    images: [
      {
        url: '/assets/images/about-image.jpg',
        alt: 'About FoiyFoshi'
      }
    ],
    active: true,
    order: 2
  },
  {
    section: 'how-it-works',
    title: 'How It Works',
    subtitle: 'Simple Steps to Start Your Reading Journey',
    content: 'Subscribe to our monthly box, wait for delivery, and enjoy your personalized reading experience!',
    images: [
      {
        url: '/assets/images/how-it-works.jpg',
        alt: 'How FoiyFoshi Works'
      }
    ],
    active: true,
    order: 3
  },
  {
    section: 'testimonials',
    title: 'What Our Readers Say',
    subtitle: 'Customer Testimonials',
    content: 'Hear from our satisfied subscribers about their FoiyFoshi experience.',
    active: true,
    order: 4
  },
  {
    section: 'faq',
    title: 'Frequently Asked Questions',
    content: 'Find answers to common questions about our subscription service.',
    active: true,
    order: 5
  },
  {
    section: 'contact',
    title: 'Get in Touch',
    subtitle: 'We\'d Love to Hear From You',
    content: 'Have questions or feedback? Contact our team for assistance.',
    links: [
      {
        url: 'mailto:info@foiyfoshi.mv',
        text: 'info@foiyfoshi.mv'
      },
      {
        url: 'tel:+9607777777',
        text: '+960 777-7777'
      }
    ],
    active: true,
    order: 6
  }
];

// Import data into DB
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Content.deleteMany();

    console.log('Data cleared...');

    // Hash admin password
    const salt = await bcrypt.genSalt(10);
    adminUser.password = await bcrypt.hash(adminUser.password, salt);

    // Create admin user
    await User.create(adminUser);
    console.log('Admin user created...');

    // Create products
    await Product.insertMany(sampleProducts);
    console.log('Sample products imported...');

    // Create content
    await Content.insertMany(sampleContent);
    console.log('Sample content imported...');

    console.log('Data import completed!');
    
    // Clean up connections
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
      console.log('MongoDB Memory Server stopped');
    }
    process.exit();
  } catch (err) {
    console.error(`Error: ${err}`);
    if (mongod) {
      await mongod.stop();
    }
    process.exit(1);
  }
};

// Delete all data from DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();
    await Content.deleteMany();

    console.log('Data destroyed!');
    
    // Clean up connections
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
      console.log('MongoDB Memory Server stopped');
    }
    process.exit();
  } catch (err) {
    console.error(`Error: ${err}`);
    if (mongod) {
      await mongod.stop();
    }
    process.exit(1);
  }
};

// Check command argument
if (process.argv[2] === '-d') {
  connectDB().then(() => deleteData());
} else {
  connectDB().then(() => importData());
}
