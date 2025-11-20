# 🚀 Render Backend Deployment Setup

## ✅ **Correct Render Settings for Backend:**

### **Service Configuration:**

**Service Type:** `Web Service`

**Root Directory:**
- Leave **EMPTY** (or set to `.`)
- **DO NOT** set to `src` or `job-portal-backend/src`

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

**Environment:**
- `Node`
- Version: `20.x` (recommended)

### **Environment Variables:**

Add these in Render dashboard:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-minimum-32-characters
JWT_EXPIRE=30d
FRONTEND_URL=https://jobs.weblibron.com
BACKEND_URL=https://your-backend-service.onrender.com
GOOGLE_CLIENT_ID=1017917944371-c919rkmicfi35vs034lh5q6543ckojbl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
SESSION_SECRET=your-random-session-secret-minimum-32-characters
ADZUNA_APP_ID=06d3c968
ADZUNA_APP_KEY=99a383380cda28c24599ebc95e220c4d
```

### **Optional (if using):**
```env
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PRO_PRICE_ID=your-pro-price-id
STRIPE_ENTERPRISE_PRICE_ID=your-enterprise-price-id
NEXT_PUBLIC_ADSENSE_CLIENT_ID=your-adsense-client-id
```

## 🔧 **If Getting Root Directory Error:**

1. Go to **Settings** → **Build & Deploy**
2. Find **"Root Directory"** field
3. **CLEAR IT** (leave empty)
4. Save and redeploy

---

**Status:** ✅ Backend ready for Render deployment

