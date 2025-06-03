# FoiyFoshi Production Deployment Guide

## Pre-deployment Checklist

### 1. Security Configuration
- [ ] Change default admin credentials in environment variables
- [ ] Set strong JWT secret (minimum 32 characters)
- [ ] Configure CORS origin for your domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting
- [ ] Review and update security headers

### 2. Database Setup
- [ ] Set up production MongoDB instance
- [ ] Configure database connection string
- [ ] Run database seeder if needed
- [ ] Set up database backups

### 3. Email Configuration
- [ ] Configure SMTP settings (Gmail recommended)
- [ ] Test email sending functionality
- [ ] Set up email templates

### 4. Environment Variables
Copy `backend/config/env.example` to `backend/.env` and update:

```bash
# Production Environment Variables
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://your-mongodb-url/foiyfoshi_production
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRE=30d
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
ADMIN_EMAIL=admin@foiyfoshi.mv
ADMIN_PASSWORD=your-secure-admin-password
CORS_ORIGIN=https://your-domain.com
```

## Deployment Steps

### Option 1: Traditional VPS/Server Deployment

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   
   # Install Nginx for reverse proxy
   sudo apt install nginx -y
   ```

2. **Application Deployment**
   ```bash
   # Clone repository
   git clone <your-repo-url> foiyfoshi
   cd foiyfoshi
   
   # Install dependencies
   npm run install-all
   
   # Build frontend
   npm run build:frontend
   
   # Set up environment variables
   cp backend/config/env.example backend/.env
   # Edit backend/.env with your production values
   
   # Start application with PM2
   pm2 start backend/server.js --name "foiyfoshi-backend"
   pm2 startup
   pm2 save
   ```

3. **Nginx Configuration**
   ```nginx
   # /etc/nginx/sites-available/foiyfoshi
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **SSL Setup with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d your-domain.com
   ```

### Option 2: Heroku Deployment

1. **Prepare for Heroku**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login to Heroku
   heroku login
   
   # Create Heroku app
   heroku create foiyfoshi-app
   ```

2. **Configure Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set MONGO_URI=your-mongodb-uri
   # ... set all other environment variables
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 3: DigitalOcean App Platform

1. **Create App**
   - Connect your GitHub repository
   - Select branch: `main`
   - Auto-deploy: Enable

2. **Configure Build**
   - Build Command: `npm run install-all && npm run build:frontend`
   - Run Command: `cd backend && npm start`

3. **Set Environment Variables**
   - Add all required environment variables in the App Platform dashboard

## Post-Deployment

### 1. Database Seeding
```bash
# Run seeder to create initial data
cd backend && npm run seed
```

### 2. Admin Account Setup
- Visit `/api/auth/create-dev-admin` (only available in development)
- Or manually create admin account through database

### 3. Testing
- [ ] Test user registration and login
- [ ] Test email functionality
- [ ] Test payment processing
- [ ] Test admin functionality
- [ ] Test image uploads
- [ ] Check all API endpoints

### 4. Monitoring
- Set up application monitoring
- Configure error logging
- Set up database monitoring
- Configure backup schedules

## Security Considerations

### 1. Admin Access
- Change default admin credentials immediately
- Use strong passwords
- Enable 2FA if possible

### 2. Database Security
- Use MongoDB Atlas or secure self-hosted instance
- Enable authentication
- Configure firewall rules

### 3. SSL/TLS
- Always use HTTPS in production
- Configure secure headers
- Use secure cookies

### 4. Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Regular security audits

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Check Node.js version (18+ required)
   - Clear node_modules and reinstall
   - Check for TypeScript/ESLint errors

2. **Database Connection**
   - Verify MongoDB URI
   - Check network connectivity
   - Verify authentication credentials

3. **Email Issues**
   - Check SMTP credentials
   - Verify email service configuration
   - Test with development email

4. **File Upload Issues**
   - Check upload directory permissions
   - Verify file size limits
   - Check disk space

## Performance Optimization

### 1. Frontend
- Gzip compression enabled
- Image optimization
- Code splitting
- CDN for static assets

### 2. Backend
- Database indexing
- Query optimization
- Response caching
- Connection pooling

### 3. Server
- Use PM2 clustering
- Configure Nginx compression
- Set up caching layers
- Monitor resource usage

## Backup Strategy

### 1. Database Backups
- Daily automated backups
- Off-site backup storage
- Test restoration procedures

### 2. File Backups
- Upload directory backups
- Application code backups
- Configuration backups

## Support

For deployment support, please check:
- Application logs: `pm2 logs foiyfoshi-backend`
- Nginx logs: `/var/log/nginx/error.log`
- Database logs
- Browser console for frontend issues 