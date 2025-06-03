# 📚 FoiyFoshi - Maldives Book Subscription Platform

A comprehensive e-commerce platform for book subscriptions in the Maldives, featuring a customer-facing website and powerful admin panel.

## 🌟 Features

### Customer Features
- **User Registration & Authentication** with email verification
- **Book Catalog** with advanced filtering and search
- **Shopping Cart & Checkout** with multiple payment options
- **Order Management** with real-time status tracking
- **User Profiles** with reading preferences and interests
- **Newsletter Subscription** for book recommendations
- **Responsive Design** optimized for all devices

### Admin Features
- **Comprehensive Dashboard** with real-time statistics
- **User Management** with advanced filtering and verification
- **Product Management** with image uploads and inventory tracking
- **Order Management** with payment verification
- **Content Management** for website content
- **Newsletter Management** with bulk email capabilities
- **Contact Message** handling and response system

## 🚀 Live Demo

- **Website**: [https://foiyfoshi.netlify.app](https://foiyfoshi.netlify.app)
- **Admin Panel**: [https://foiyfoshi.netlify.app/admin](https://foiyfoshi.netlify.app/admin)
- **API**: [https://foiyfoshi-backend.onrender.com](https://foiyfoshi-backend.onrender.com)

### Demo Credentials
- **Admin**: admin@foiyfoshi.mv / FoiyFoshi_Admin_Secure_Password_2024
- **Test User**: Create your own account through registration

## 🛠️ Technology Stack

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Styled Components** for CSS-in-JS styling
- **Axios** for API communication
- **React Icons** for UI icons

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Nodemailer** for email services
- **Multer** for file uploads
- **Helmet** for security headers
- **Express Rate Limit** for API protection

## 📦 Installation & Setup

### Prerequisites
- Node.js 18 or higher
- MongoDB database
- Gmail account for email service

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/foiyfoshi.git
   cd foiyfoshi
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp backend/config/env.example backend/.env
   
   # Edit the .env file with your configuration
   # Update database connection, email credentials, etc.
   ```

4. **Start development servers**
   ```bash
   npm start
   ```

   This will start both frontend (http://localhost:3000) and backend (http://localhost:5000)

5. **Seed the database (optional)**
   ```bash
   cd backend
   npm run seed
   ```

## 🌐 Deployment

### Netlify (Frontend)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build:frontend`
3. Set publish directory: `frontend/build`
4. Deploy!

### Render/Railway (Backend)
1. Connect your GitHub repository
2. Set build command: `cd backend && npm install`
3. Set start command: `cd backend && npm start`
4. Add environment variables
5. Deploy!

### Environment Variables

#### Backend (.env)
```bash
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_minimum_32_characters
JWT_EXPIRE=30d
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
ADMIN_EMAIL=admin@foiyfoshi.mv
ADMIN_PASSWORD=your_secure_admin_password
CORS_ORIGIN=https://your-frontend-domain.com
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - Email verification
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user profile

### Product Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Order Endpoints
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/myorders` - Get user orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order (Admin)

### Admin Endpoints
- `GET /api/users` - Get all users (Admin)
- `GET /api/auth/dashboard-stats` - Dashboard statistics
- `POST /api/newsletter/send` - Send newsletter (Admin)

## 🔒 Security Features

- **JWT Authentication** with secure token generation
- **Password Hashing** using bcrypt
- **Input Validation** and sanitization
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Security Headers** via Helmet.js
- **Environment Variables** for sensitive data

## 🎨 UI/UX Features

- **Responsive Design** for all screen sizes
- **Modern Color Scheme** with Maldivian-inspired colors
- **Intuitive Navigation** with breadcrumbs and search
- **Loading States** and error handling
- **Notifications** for user feedback
- **Dark/Light Theme** support (coming soon)

## 📱 Mobile Optimization

- **Touch-Friendly** interface design
- **Optimized Images** for faster loading
- **Progressive Web App** capabilities
- **Offline Support** for essential features

## 🧪 Testing

```bash
# Run frontend tests
cd frontend && npm test

# Run backend tests
cd backend && npm test

# Run production build test
npm run deploy:check
```

## 📊 Performance Metrics

- **Page Load Time**: < 3 seconds
- **API Response Time**: < 500ms
- **Bundle Size**: ~146KB (optimized)
- **Lighthouse Score**: 90+ (Performance, Accessibility, SEO)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

For support, email admin@foiyfoshi.mv or create an issue on GitHub.

## 🙏 Acknowledgments

- Designed for the beautiful Maldives book-loving community
- Built with ❤️ using modern web technologies
- Inspired by the need for accessible book subscriptions in island nations

---

**Made with 🏝️ for the Maldives** | **© 2024 FoiyFoshi**
