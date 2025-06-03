# 🚀 GitHub & Deployment Setup Guide

## Step 1: Prepare Your Local Repository

### Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: FoiyFoshi Book Subscription Platform"
```

### Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New Repository"
3. Repository name: `foiyfoshi-book-subscription`
4. Description: `Maldives Book Subscription E-commerce Platform`
5. Set to Public
6. Don't initialize with README (we already have one)
7. Click "Create Repository"

### Connect Local to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/foiyfoshi-book-subscription.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend (Render.com)

### Create Render Account
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository

### Backend Configuration
- **Name**: `foiyfoshi-backend`
- **Environment**: `Node`
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Instance Type**: `Free`

### Environment Variables (Add in Render Dashboard)
```bash
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://admin:FoiyFoshi2024@cluster0.mongodb.net/foiyfoshi_production?retryWrites=true&w=majority
JWT_SECRET=FoiyFoshi_Super_Secure_JWT_Secret_Key_2024_Production_32chars
JWT_EXPIRE=30d
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
ADMIN_EMAIL=admin@foiyfoshi.mv
ADMIN_PASSWORD=FoiyFoshi_Admin_Secure_Password_2024
CORS_ORIGIN=https://foiyfoshi.netlify.app
BCRYPT_ROUNDS=12
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### Get Your Backend URL
After deployment, your backend will be available at:
`https://foiyfoshi-backend.onrender.com`

## Step 3: Deploy Frontend (Netlify)

### Create Netlify Account
1. Go to [Netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "New site from Git"
4. Choose GitHub and select your repository

### Build Configuration
- **Base directory**: Leave empty
- **Build command**: `npm run build:frontend`
- **Publish directory**: `frontend/build`

### Environment Variables (Netlify Dashboard)
```bash
NODE_ENV=production
REACT_APP_API_URL=https://foiyfoshi-backend.onrender.com
```

### Custom Domain (Optional)
1. Go to Site Settings → Domain Management
2. Add custom domain: `foiyfoshi.com` (or your domain)
3. Configure DNS settings

## Step 4: Set Up MongoDB Atlas

### Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster (free tier)

### Database Configuration
1. **Database Access**: Create user with read/write permissions
2. **Network Access**: Add `0.0.0.0/0` (allow from anywhere)
3. **Connect**: Get connection string

### Connection String Format
```
mongodb+srv://username:password@cluster0.mongodb.net/foiyfoshi_production?retryWrites=true&w=majority
```

## Step 5: Set Up Email Service

### Gmail App Password
1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account Settings
3. Security → App passwords
4. Generate app password for "Mail"
5. Use this password in EMAIL_PASS

### Alternative: SendGrid
```bash
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
```

## Step 6: Update Backend URL in Frontend

### Update Netlify Configuration
1. Go to your Netlify site settings
2. Build & Deploy → Environment variables
3. Update `REACT_APP_API_URL` with your Render backend URL

### Update Backend CORS
1. Go to your Render service settings
2. Update `CORS_ORIGIN` environment variable with your Netlify URL

## Step 7: GitHub Actions (Automatic Deployment)

### Add Netlify Secrets to GitHub
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add these secrets:
   - `NETLIFY_AUTH_TOKEN`: Get from Netlify User Settings → Personal access tokens
   - `NETLIFY_SITE_ID`: Get from Netlify Site Settings → General → Site details

### Test Automatic Deployment
```bash
git add .
git commit -m "Update: Production deployment configuration"
git push origin main
```

## Step 8: Verify Deployment

### Frontend Checklist
- [ ] Site loads at Netlify URL
- [ ] All pages accessible
- [ ] No console errors
- [ ] API calls working

### Backend Checklist
- [ ] API responds at Render URL
- [ ] Database connection working
- [ ] Email sending functional
- [ ] File uploads working

### Integration Testing
- [ ] User registration with email verification
- [ ] Admin login with dashboard
- [ ] Product creation and image upload
- [ ] Order placement and management
- [ ] Newsletter functionality

## Step 9: Custom Domain Setup (Optional)

### Domain Registration
1. Purchase domain from provider (Namecheap, GoDaddy, etc.)
2. Point DNS to Netlify:
   - Type: `A` Record
   - Name: `@`
   - Value: `75.2.60.5`
   - Type: `CNAME`
   - Name: `www`
   - Value: `your-site.netlify.app`

### SSL Certificate
Netlify automatically provides SSL certificates for custom domains.

## Step 10: Monitoring & Maintenance

### Set Up Monitoring
- **Render**: Monitor backend performance and logs
- **Netlify**: Monitor frontend deployments and analytics
- **MongoDB Atlas**: Monitor database performance

### Regular Maintenance
- Update dependencies monthly
- Monitor error logs weekly
- Backup database regularly
- Review security updates

## 🛠️ Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build:frontend
```

#### CORS Errors
- Verify CORS_ORIGIN matches frontend URL exactly
- Check both HTTP and HTTPS versions

#### Database Connection
- Verify MongoDB Atlas IP whitelist
- Check connection string format
- Ensure database user has proper permissions

#### Email Not Sending
- Verify Gmail app password
- Check EMAIL_SERVICE configuration
- Test with different email provider

### Support Resources
- [Render Documentation](https://render.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)

## 🎉 Success!

Your FoiyFoshi platform is now live and accessible worldwide!

- **Frontend**: `https://your-site.netlify.app`
- **Admin Panel**: `https://your-site.netlify.app/admin`
- **API**: `https://your-backend.onrender.com`

Remember to:
1. Change default admin credentials
2. Set up proper email service
3. Configure custom domain (optional)
4. Monitor application performance
5. Set up regular database backups 