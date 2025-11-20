# ✅ Render Backend Deployment Verification

## **Step 1: Verify Backend is Running**

### **Check Backend URL:**
Your backend should be accessible at: `https://api.weblibron.com`

### **Test Backend Health:**
```bash
curl https://api.weblibron.com/api/adzuna/test
```

**Expected Response:**
```json
{
  "success": true,
  "configured": true,
  "hasAppId": true,
  "hasAppKey": true
}
```

If you get `"configured": false`, the Adzuna credentials are not set.

---

## **Step 2: Verify Environment Variables**

### **Required Environment Variables in Render:**

Go to **Render Dashboard** → **Your Backend Service** → **Environment** tab

**Check these are set:**

```env
# ✅ REQUIRED - Adzuna API
ADZUNA_APP_ID=06d3c968
ADZUNA_APP_KEY=99a383380cda28c24599ebc95e220c4d

# ✅ REQUIRED - CORS Configuration
FRONTEND_URL=https://jobs.weblibron.com

# ✅ REQUIRED - Backend URL
BACKEND_URL=https://api.weblibron.com

# ✅ REQUIRED - Database
MONGO_URI=your-mongodb-connection-string
MONGODB_URI=your-mongodb-connection-string

# ✅ REQUIRED - Authentication
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# ✅ REQUIRED - Server
PORT=10000
NODE_ENV=production

# ✅ OPTIONAL - Email (if using email features)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# ✅ OPTIONAL - Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ✅ OPTIONAL - Stripe (if using payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## **Step 3: Test Endpoints**

### **1. Test Adzuna Endpoint:**
```bash
curl "https://api.weblibron.com/api/adzuna/jobs?country=us&resultsPerPage=10&page=1"
```

**Expected Response:**
```json
{
  "success": true,
  "jobs": [...],
  "count": 10,
  "total": 7045836,
  "page": 1,
  "totalPages": 704584
}
```

**If Error:**
- `{"success":false,"message":"Adzuna API credentials not configured"}` 
  → Add `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` to environment variables

### **2. Test Jobs Endpoint:**
```bash
curl "https://api.weblibron.com/api/jobs?all=true&page=1&limit=20"
```

**Expected Response:**
```json
{
  "success": true,
  "jobs": [...],
  "total": 100,
  "page": 1,
  "totalPages": 5
}
```

### **3. Test CORS:**
```bash
curl -H "Origin: https://jobs.weblibron.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     "https://api.weblibron.com/api/adzuna/jobs" \
     -v
```

**Expected Headers:**
```
Access-Control-Allow-Origin: https://jobs.weblibron.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Credentials: true
```

---

## **Step 4: Check Render Logs**

1. Go to **Render Dashboard** → **Your Backend Service**
2. Click **Logs** tab
3. Look for:
   - ✅ `✅ MongoDB Connected: ...`
   - ✅ `✅ Registering Google OAuth strategy...` (if configured)
   - ✅ `Server running on port ...`
   - ❌ Any error messages

**Common Errors:**
- `MongoDB connection failed` → Check `MONGO_URI`
- `Adzuna API credentials not configured` → Add `ADZUNA_APP_ID` and `ADZUNA_APP_KEY`
- `CORS blocked origin` → Add `FRONTEND_URL`

---

## **Step 5: Verify Frontend Connection**

### **Check Frontend Environment Variable:**

In your **frontend** (Vercel), ensure:

```env
NEXT_PUBLIC_API_URL=https://api.weblibron.com
```

### **Test from Browser:**

1. Open: `https://jobs.weblibron.com`
2. Open **DevTools** (F12) → **Console** tab
3. Look for:
   - `🔍 Fetching Adzuna jobs from: https://api.weblibron.com/api/adzuna/jobs`
   - `✅ Adzuna API response received:`
   - Or error messages

4. Open **Network** tab:
   - Find request to `/api/adzuna/jobs`
   - Check **Status Code** (should be 200)
   - Check **Response** (should have `success: true`)

---

## **Step 6: Common Issues & Fixes**

### **Issue 1: "Adzuna API credentials not configured"**
**Fix:**
1. Go to Render → Environment tab
2. Add:
   ```env
   ADZUNA_APP_ID=06d3c968
   ADZUNA_APP_KEY=99a383380cda28c24599ebc95e220c4d
   ```
3. Save → Backend will auto-restart

### **Issue 2: CORS Error in Browser**
**Fix:**
1. Go to Render → Environment tab
2. Add:
   ```env
   FRONTEND_URL=https://jobs.weblibron.com
   ```
3. Save → Backend will auto-restart

### **Issue 3: "Cannot connect to server"**
**Fix:**
1. Verify backend is running in Render dashboard
2. Check backend URL is correct: `https://api.weblibron.com`
3. Verify `NEXT_PUBLIC_API_URL` in frontend is set correctly

### **Issue 4: MongoDB Connection Error**
**Fix:**
1. Check `MONGO_URI` is set correctly
2. Verify MongoDB connection string is valid
3. Check MongoDB allows connections from Render IPs

---

## **Step 7: Deployment Checklist**

- [ ] Backend deployed on Render
- [ ] Backend URL accessible: `https://api.weblibron.com`
- [ ] All environment variables set in Render
- [ ] Adzuna credentials configured
- [ ] CORS configured (`FRONTEND_URL` set)
- [ ] MongoDB connected (check logs)
- [ ] Frontend `NEXT_PUBLIC_API_URL` set to backend URL
- [ ] Test endpoints return data
- [ ] Frontend can fetch data (check browser console)

---

## **Quick Test Commands:**

```bash
# Test Adzuna credentials
curl https://api.weblibron.com/api/adzuna/test

# Test Adzuna jobs
curl "https://api.weblibron.com/api/adzuna/jobs?country=us&resultsPerPage=5"

# Test all jobs
curl "https://api.weblibron.com/api/jobs?all=true&limit=5"

# Test CORS
curl -H "Origin: https://jobs.weblibron.com" -X OPTIONS https://api.weblibron.com/api/adzuna/jobs -v
```

---

**Status:** ✅ Use this guide to verify your Render deployment is working correctly!

