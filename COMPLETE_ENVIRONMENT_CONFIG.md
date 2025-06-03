# 🌟 Complete Environment Configuration for FoiyFoshi

## 📋 Production Environment Variables (.env)

Copy this configuration to your `backend/.env` file and update all placeholder values:

```bash
# =============================================================================
# 📚 FOIYFOSHI PRODUCTION ENVIRONMENT CONFIGURATION
# =============================================================================
# IMPORTANT: Update all placeholder values with your actual credentials!

# =============================================================================
# 🌍 APPLICATION ENVIRONMENT
# =============================================================================
NODE_ENV=production
PORT=5000

# =============================================================================
# 🗃️ DATABASE CONFIGURATION (MongoDB Atlas)
# =============================================================================
# Get this from MongoDB Atlas: Database → Connect → Connect your application
# Format: mongodb+srv://username:password@cluster.mongodb.net/database?options
MONGO_URI=mongodb+srv://foiyfoshi_admin:FoiyFoshi2024!SecurePass@cluster0.mongodb.net/foiyfoshi_production?retryWrites=true&w=majority&appName=FoiyFoshi

# =============================================================================
# 🔐 JWT AUTHENTICATION
# =============================================================================
# SECURITY: Change this to a unique 32+ character secret for production!
JWT_SECRET=FoiyFoshi_Super_Secure_JWT_Secret_Key_Production_2024_Must_Be_32_Plus_Characters
JWT_EXPIRE=30d

# =============================================================================
# 📧 EMAIL CONFIGURATION (Gmail SMTP)
# =============================================================================
# For Gmail: Enable 2FA and generate App Password
# Gmail App Password: Google Account → Security → App passwords
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=admin@foiyfoshi.com
EMAIL_PASS=your_gmail_16_character_app_password
EMAIL_USERNAME=admin@foiyfoshi.com
EMAIL_PASSWORD=your_gmail_16_character_app_password

# Email From Address (what recipients see)
EMAIL_FROM_NAME=FoiyFoshi Book Subscription
EMAIL_FROM_ADDRESS=admin@foiyfoshi.com

# =============================================================================
# 👤 ADMIN ACCOUNT CONFIGURATION
# =============================================================================
# SECURITY: Change these credentials immediately after first deployment!
ADMIN_EMAIL=admin@foiyfoshi.mv
ADMIN_PASSWORD=FoiyFoshi_Admin_Ultra_Secure_Password_2024!

# Admin Profile Details
ADMIN_NAME=FoiyFoshi Administrator
ADMIN_PHONE=+960-123-4567

# =============================================================================
# 🛡️ SECURITY CONFIGURATION
# =============================================================================
# CORS: Your frontend domain (Netlify URL or custom domain)
CORS_ORIGIN=https://foiyfoshi.netlify.app

# Alternative: Multiple origins separated by commas
# CORS_ORIGIN=https://foiyfoshi.netlify.app,https://foiyfoshi.com,https://www.foiyfoshi.com

# Password Hashing Rounds (higher = more secure but slower)
BCRYPT_ROUNDS=12

# =============================================================================
# 📁 FILE UPLOAD CONFIGURATION
# =============================================================================
# Maximum file size for uploads (5MB = 5242880 bytes)
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Allowed file types for product images
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,webp,gif

# =============================================================================
# 🚦 RATE LIMITING
# =============================================================================
# Rate limiting for API requests (production security)
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# =============================================================================
# 💳 PAYMENT CONFIGURATION (Future Implementation)
# =============================================================================
# Bank Transfer Settings (Maldives banks)
DEFAULT_BANK_NAME=Bank of Maldives
DEFAULT_BANK_ACCOUNT=1234567890
DEFAULT_BANK_ACCOUNT_NAME=FoiyFoshi Pvt Ltd

# Future Payment Gateway Integration
# STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
# STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
# PAYPAL_CLIENT_ID=your_paypal_client_id
# PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# =============================================================================
# 📊 MONITORING & LOGGING
# =============================================================================
# Application monitoring (optional)
# SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id

# Logging level
LOG_LEVEL=info

# =============================================================================
# 🌐 SOCIAL MEDIA & BUSINESS INFORMATION
# =============================================================================
# Business Details
BUSINESS_NAME=FoiyFoshi
BUSINESS_EMAIL=info@foiyfoshi.mv
BUSINESS_PHONE=+960-123-4567
BUSINESS_ADDRESS=Male, Republic of Maldives

# Social Media Links
FACEBOOK_URL=https://facebook.com/foiyfoshi
INSTAGRAM_URL=https://instagram.com/foiyfoshi
TWITTER_URL=https://twitter.com/foiyfoshi

# =============================================================================
# 🔧 DEVELOPMENT & DEBUG (Set to false in production)
# =============================================================================
DEBUG_MODE=false
ENABLE_SWAGGER=false
ENABLE_CORS_DEBUG=false

# =============================================================================
# ☁️ DEPLOYMENT PLATFORM SPECIFIC
# =============================================================================
# Render.com Configuration
RENDER_EXTERNAL_URL=https://foiyfoshi-backend.onrender.com

# Netlify Configuration  
NETLIFY_SITE_URL=https://foiyfoshi.netlify.app

# =============================================================================
# 🌍 INTERNATIONALIZATION (Future)
# =============================================================================
DEFAULT_LANGUAGE=en
SUPPORTED_LANGUAGES=en,dv
TIMEZONE=Indian/Maldives

# =============================================================================
# 🔒 SECURITY HEADERS
# =============================================================================
# Security headers for production
HELMET_CONTENT_SECURITY_POLICY=default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
HELMET_HSTS_MAX_AGE=31536000
```

## 🎯 Required Setup Steps

### 1. 🗃️ MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account and cluster
3. Create database user: `foiyfoshi_admin`
4. Set password: `FoiyFoshi2024!SecurePass`
5. Network Access: Add `0.0.0.0/0` (allow from anywhere)
6. Get connection string and update `MONGO_URI`

### 2. 📧 Gmail Setup for Email Service
1. **Enable 2-Factor Authentication** on your Gmail account
2. Go to **Google Account Settings** → **Security**
3. Click **App passwords** (you'll need 2FA enabled first)
4. Select **Mail** and generate password
5. Update `EMAIL_USER` with your Gmail address
6. Update `EMAIL_PASS` with the 16-character app password

### 3. 🛡️ Security Configuration
```bash
# Generate a strong JWT secret (32+ characters)
JWT_SECRET=your_unique_32_plus_character_secret

# Update admin credentials
ADMIN_EMAIL=your_admin_email@domain.com
ADMIN_PASSWORD=your_ultra_secure_admin_password

# Update CORS origin with your actual domain
CORS_ORIGIN=https://your-actual-domain.com
```

## 🚀 Deployment Platform Configuration

### Render.com Backend Deployment
Add these environment variables in Render dashboard:
```
NODE_ENV=production
PORT=10000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_32_character_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_character_app_password
ADMIN_EMAIL=admin@foiyfoshi.mv
ADMIN_PASSWORD=your_secure_password
CORS_ORIGIN=https://your-netlify-site.netlify.app
BCRYPT_ROUNDS=12
```

### Netlify Frontend Deployment
Add these environment variables in Netlify dashboard:
```
NODE_ENV=production
REACT_APP_API_URL=https://your-render-backend.onrender.com
```

## 🔧 Quick Setup Commands

### 1. Create .env file in backend directory:
```bash
# Navigate to backend directory
cd backend

# Create .env file (copy the configuration above)
# For Windows:
echo. > .env

# For Mac/Linux:
touch .env

# Then paste the configuration above into the .env file
```

### 2. Test Environment Configuration:
```bash
# Test backend with environment variables
npm start

# Check if environment variables are loaded
node -e "require('dotenv').config(); console.log('MongoDB URI:', process.env.MONGO_URI ? '✅ Configured' : '❌ Missing')"
```

## 🔍 Environment Variable Validation

Add this to your `backend/server.js` to validate required variables:

```javascript
// Environment variable validation
const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  process.exit(1);
}

console.log('✅ All required environment variables are configured');
```

## 🛡️ Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong passwords** (12+ characters with mixed case, numbers, symbols)
3. **Rotate secrets regularly** (JWT secret, admin password)
4. **Use HTTPS only** in production
5. **Keep CORS origins specific** to your domains
6. **Monitor for security vulnerabilities**

## 📋 Setup Checklist

- [ ] MongoDB Atlas cluster created and connection string configured
- [ ] Gmail app password generated and configured
- [ ] JWT secret generated (32+ characters)
- [ ] Admin credentials changed from defaults
- [ ] CORS origin updated with actual domain
- [ ] All environment variables tested
- [ ] Backend deployed and running
- [ ] Frontend deployed and connected to backend
- [ ] Email functionality tested
- [ ] Admin login tested
- [ ] Production build completed successfully

## 🆘 Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Check network access in MongoDB Atlas
   - Verify username/password in connection string
   - Ensure IP whitelist includes your deployment platform

2. **Email Not Sending**
   - Verify Gmail app password is correct
   - Check 2FA is enabled on Gmail account
   - Test with a simple email sending script

3. **CORS Errors**
   - Ensure CORS_ORIGIN matches your frontend domain exactly
   - Include protocol (https://) in CORS_ORIGIN
   - Check for trailing slashes

4. **Admin Login Issues**
   - Verify ADMIN_EMAIL and ADMIN_PASSWORD are set
   - Check JWT_SECRET is configured
   - Ensure admin user is created in database

Your FoiyFoshi platform is now ready for production deployment! 🎉 