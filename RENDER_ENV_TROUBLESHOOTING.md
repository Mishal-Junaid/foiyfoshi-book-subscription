# 🔧 RENDER ENVIRONMENT VARIABLES TROUBLESHOOTING

## ❌ **CURRENT ISSUE:**
```
🔍 Environment Debug Info:
NODE_ENV: production
MONGO_URI exists: false
MONGO_URI value: undefined
All env vars starting with MONGO: []
```

**This confirms that Render is NOT reading the environment variables at all.**

---

## 🎯 **STEP-BY-STEP FIX:**

### **Step 1: Verify Environment Variables in Render Dashboard**

1. **Go to your Render service**: https://dashboard.render.com/
2. **Click on your backend service** (foiyfoshi-backend)
3. **Navigate to "Environment" tab**
4. **Verify you see ALL these variables**:

```
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://admin:admin123@cluster0.gppxck4.mongodb.net/foiyfoshi_production?retryWrites=true&w=majority
JWT_SECRET=FoiyFoshi_Super_Secure_JWT_Secret_Key_2024_Production_32chars_Strong
JWT_EXPIRE=30d
EMAIL_SERVICE=smtp
EMAIL_HOST=smtpout.secureserver.net
EMAIL_PORT=587
EMAIL_USER=admin@foiyfoshi.com
EMAIL_PASS=bookbox03136
EMAIL_FROM=admin@foiyfoshi.com
ADMIN_EMAIL=admin@foiyfoshi.mv
ADMIN_PASSWORD=FoiyFoshi_Admin_Secure_Password_2024_Strong!
CORS_ORIGIN=https://foiyfoshi.netlify.app
BCRYPT_ROUNDS=12
```

### **Step 2: Common Render Environment Variable Issues**

#### **❌ Issue: Variables not showing up**
**Solution**: 
- Click "Add Environment Variable" 
- Enter **Key** and **Value** separately
- **DO NOT** add quotes around values
- **DO NOT** add spaces around the `=` sign

#### **❌ Issue: Variables added but not working**
**Solutions**:
1. **Delete and re-add** the MONGO_URI variable
2. **Copy-paste exactly** from the values above
3. **Save** after each variable
4. **Redeploy** the service

#### **❌ Issue: Special characters in MongoDB URI**
**Solution**: Make sure the MongoDB URI doesn't have any URL encoding issues:
```
✅ CORRECT: mongodb+srv://admin:admin123@cluster0.gppxck4.mongodb.net/foiyfoshi_production?retryWrites=true&w=majority
❌ WRONG: mongodb%2Bsrv://admin%3Aadmin123@...
```

### **Step 3: Force Redeploy**

After adding/updating environment variables:
1. **Go to "Deploys" tab**
2. **Click "Trigger Deploy"**
3. **Select "Deploy Latest Commit"**
4. **Wait for deployment to complete**
5. **Check logs** for the debug output

---

## 🔍 **DEBUGGING STEPS:**

### **Expected Success Output:**
```
🔍 Environment Debug Info:
NODE_ENV: production
MONGO_URI exists: true
MONGO_URI value: mongodb+srv://admin...
All env vars starting with MONGO: ['MONGO_URI']
✅ Using provided MONGO_URI
✅ MongoDB Connected: cluster0-...
```

### **If Still Not Working:**

1. **Check Render Service Type**:
   - Make sure it's a **"Web Service"** not "Static Site"
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`

2. **Check Environment Tab**:
   - Variables should show "Set" status
   - No red error indicators
   - Values should not be truncated

3. **Try Alternative MongoDB URI Format**:
   ```
   MONGO_URI=mongodb+srv://admin:admin123@cluster0.gppxck4.mongodb.net/foiyfoshi_production
   ```

4. **Check for Hidden Characters**:
   - Copy environment variables from a plain text editor
   - Avoid copying from formatted documents

---

## 🚨 **EMERGENCY WORKAROUND:**

If environment variables still don't work, we can hardcode them temporarily:

1. **Edit backend/config/db.js**
2. **Add fallback values**:
```javascript
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://admin:admin123@cluster0.gppxck4.mongodb.net/foiyfoshi_production?retryWrites=true&w=majority';
```

**Note**: This is ONLY for testing. Remove hardcoded values before final deployment.

---

## 📋 **CHECKLIST:**

- [ ] Environment variables added to Render dashboard
- [ ] Variables show "Set" status (no errors)
- [ ] Service redeployed after adding variables
- [ ] Debug logs show `MONGO_URI exists: true`
- [ ] MongoDB connection established
- [ ] API endpoints responding

---

## 📞 **IF STILL NOT WORKING:**

**Report back with**:
1. Screenshot of Render Environment tab
2. First 20 lines of deployment logs
3. Any error messages in Render dashboard

**The debug output will tell us exactly what Render is seeing!** 