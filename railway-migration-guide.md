# 🚂 Migration Guide: Render → Railway

## Why Railway?
- ✅ **500 hours/month** free tier (vs 100 hours on Render)
- ✅ **Faster cold starts** (2-3 seconds vs 10-30 seconds)
- ✅ **Better developer experience**
- ✅ **No spin-down** on paid plan ($5/month vs $7/month)

## Step-by-Step Migration

### 1. Backup Current Setup
```bash
# Create backup of environment variables
echo "MONGO_URI=your_current_mongo_uri" > .env.backup
echo "JWT_SECRET=your_current_jwt_secret" >> .env.backup
```

### 2. Deploy to Railway

#### Backend Deployment:
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `foiyfoshi` repository
5. Choose the `backend` folder as root directory
6. Add environment variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret
   - `NODE_ENV`: production
   - `PORT`: 3000 (Railway default)

#### Frontend Deployment:
1. **Option A**: Deploy frontend to Railway too
2. **Option B**: Keep on Netlify (recommended)
3. **Option C**: Move to Vercel

### 3. Update Frontend API URL
```javascript
// In frontend/.env.production
REACT_APP_API_URL=https://your-railway-backend-url.railway.app
```

### 4. Update CORS Settings
```javascript
// In backend/server.js
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://foiy-foshi.netlify.app',
        'https://your-railway-frontend-url.railway.app' // If using Railway for frontend
      ]
    : ['http://localhost:3000'],
  // ... rest of config
};
```

### 5. Test the Migration
```bash
# Test backend
curl https://your-railway-backend-url.railway.app/api/products

# Test admin login
node test-admin2-login.js
```

## Cost Comparison

| Service | Free Tier | Paid Tier | Spin-down | Performance |
|---------|-----------|-----------|-----------|-------------|
| **Render** | 100hrs/month | $7/month | ❌ 15min timeout | Slow cold start |
| **Railway** | 500hrs/month | $5/month | ✅ No timeout | Fast cold start |
| **Vercel** | Unlimited | $20/month | ✅ Serverless | Instant |

## Recommended Setup (Best Performance + Cost)

1. **Frontend**: Netlify (free)
2. **Backend**: Railway ($5/month)
3. **Database**: MongoDB Atlas (free)
4. **Total**: $5/month with excellent performance

## Alternative: Keep-Alive on Render (Free)

If you want to stay on Render:
```bash
# Run the keep-alive service locally or on a different free service
node keep-alive-service.js
```

## Migration Checklist

- [ ] Backup environment variables
- [ ] Deploy backend to Railway
- [ ] Update frontend API URL
- [ ] Update CORS settings
- [ ] Test all functionality
- [ ] Update DNS (if using custom domain)
- [ ] Monitor for 24 hours
- [ ] Remove old Render service 