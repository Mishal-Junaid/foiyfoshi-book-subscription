# 🚀 FoiyFoshi Application Startup Guide

## Quick Start (Recommended)

### Option 1: Using NPM (Easiest)
```bash
npm start
```

### Option 2: Using PowerShell Script
```bash
.\start-all.ps1
```

### Option 3: Using Batch File
```bash
.\start.bat
```

## Manual Startup

### Backend Server
```bash
cd backend
set NODE_ENV=development
set JWT_SECRET=foiyfoshi_secret_key_2024
set JWT_EXPIRE=30d
set PORT=5000
set MONGO_URI=mongodb://localhost:27017/foiyfoshi
node server.js
```

### Frontend Server (in new terminal)
```bash
cd frontend
npm start
```

## Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Panel**: http://localhost:3000/admin

## Development Tools

### DevHelper Panel
Look for the red **"DEV TOOLS"** panel in the top-right corner of the frontend:
- **Create Admin**: Creates admin user (admin@foiyfoshi.mv / admin123)
- **Clear Storage**: Clears browser storage
- **Show Auth**: Shows current authentication status

### Admin Credentials
- **Email**: admin@foiyfoshi.mv
- **Password**: admin123

## Status Check

Run this to check if everything is working:
```bash
.\check-status.ps1
```

## Troubleshooting

### If servers won't start:
1. Make sure MongoDB is running: `net start MongoDB`
2. Kill existing Node processes: `Get-Process -Name "node" | Stop-Process -Force`
3. Try starting again

### If you get port errors:
- Backend uses port 5000
- Frontend uses port 3000
- Make sure these ports aren't being used by other applications

### If MongoDB connection fails:
1. Install MongoDB: `winget install MongoDB.Server`
2. Start MongoDB service: `net start MongoDB`
3. Verify connection: `mongo --eval "db.runCommand('ping')"`

## Features Available

✅ **User Management**
- User registration with OTP verification
- User login/logout
- Profile management

✅ **Product Management**
- Browse books and subscriptions
- Add to cart
- Product search and filtering

✅ **Order Management**
- Complete checkout process
- Bank transfer payment
- Receipt upload
- Order tracking
- Email notifications

✅ **Admin Features**
- Product CRUD operations
- Order management
- User management
- Content management
- Payment verification

✅ **Content Management**
- Dynamic content creation
- Image uploads
- Content categorization

## Environment Variables

The application uses these environment variables:
- `NODE_ENV=development`
- `JWT_SECRET=foiyfoshi_secret_key_2024`
- `JWT_EXPIRE=30d`
- `PORT=5000`
- `MONGO_URI=mongodb://localhost:27017/foiyfoshi`

## Support

If you encounter any issues:
1. Check the status with `.\check-status.ps1`
2. Look at the terminal output for error messages
3. Ensure MongoDB is running
4. Verify all dependencies are installed with `npm install-all` 