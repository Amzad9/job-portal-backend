# 📝 Environment Variables Update Guide

## ✅ **Current `.env` File Structure**

Your `.env` file should include all the following variables organized by category:

### **1. Server Configuration**
```env
PORT=5001
NODE_ENV=development
```

### **2. Database**
```env
MONGO_URI=mongodb+srv://job:QmhuXtWi4KTRq6X3@cluster0.bkj5bcg.mongodb.net/
MONGODB_URI=mongodb+srv://job:QmhuXtWi4KTRq6X3@cluster0.bkj5bcg.mongodb.net/
```

### **3. Authentication**
```env
JWT_SECRET=25d62df4f092f330d99303a183f0f56610ca752afb340d123f25b7e873af1d3454e382e4b8aaaecafb2f3b11f3bee2098d09e6edd744787131a1b042550cf06a
JWT_EXPIRE=30d
SESSION_SECRET=25d62df4f092f330d99303a183f0f56610ca752afb340d123f25b7e873af1d3454e382e4b8aaaecafb2f3b11f3bee2098d09e6edd744787131a1b042550cf06a
```

### **4. URLs**
```env
FRONTEND_URL=https://jobs.weblibron.com
BACKEND_URL=https://your-render-backend-url.onrender.com
```

### **5. Email (Update with your credentials)**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-amzad@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### **6. Google OAuth**
```env
GOOGLE_CLIENT_ID=1017917944371-c919rkmicfi35vs034lh5q6543ckojbl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### **7. Adzuna API**
```env
ADZUNA_APP_ID=06d3c968
ADZUNA_APP_KEY=99a383380cda28c24599ebc95e220c4d
ADZUNA_IMPORT_SCHEDULE=0 */3 * * *
ADZUNA_IMPORT_COUNTRIES=us
ADZUNA_RESULTS_PER_PAGE=50
ENABLE_ADZUNA_IMPORT=true
```

### **8. Stripe (Optional - if using payments)**
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

## 🔧 **What to Update:**

1. **`BACKEND_URL`** - Update to your Render backend URL after deployment
2. **`EMAIL_USER`** - Update with your actual Gmail address
3. **`EMAIL_PASSWORD`** - Update with Gmail App Password
4. **`EMAIL_FROM`** - Update with sender email
5. **`STRIPE_*`** - Update if you're using Stripe payments

## 📋 **For Render Deployment:**

Add ALL these variables in Render Dashboard:
1. Go to your service → **Environment** tab
2. Add each variable from your `.env` file
3. Make sure `FRONTEND_URL` and `BACKEND_URL` are set to production URLs

## ✅ **Template File:**

A `.env.example` file has been created with all required variables. You can use it as a reference.

---

**Status:** ✅ Environment variables documented and organized

