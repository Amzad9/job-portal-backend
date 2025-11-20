# ✅ FINAL CORS FIX - Step by Step

## **Current Issue:**
- Backend is accessible (returns 200 when tested directly)
- Browser shows "Cannot connect to server" error
- This is a **CORS blocking issue** - browser is blocking the request

## **Root Cause:**
The backend is blocking requests from `https://jobs.weblibron.com` because `FRONTEND_URL` environment variable is not set in Render.

## **Complete Fix:**

### **Step 1: Add Environment Variable to Render**

1. **Go to Render Dashboard:**
   - https://dashboard.render.com
   - Sign in
   - Find your backend service

2. **Open Environment Tab:**
   - Click on your backend service
   - Click **"Environment"** in left sidebar

3. **Add FRONTEND_URL:**
   - Click **"Add Environment Variable"**
   - **Key:** `FRONTEND_URL`
   - **Value:** `https://jobs.weblibron.com`
   - Click **"Save Changes"**

4. **Wait for Restart:**
   - Backend will auto-restart (1-2 minutes)
   - Check "Logs" tab to see restart

### **Step 2: Verify CORS is Working**

After restart, check backend logs. You should see:

```
🌐 CORS Configuration:
   FRONTEND_URL: https://jobs.weblibron.com
   Allowed origins: [ 'https://jobs.weblibron.com' ]
   NODE_ENV: production
```

### **Step 3: Test from Browser**

1. Open: `https://jobs.weblibron.com`
2. Open DevTools (F12) → Console
3. Should see:
   - `✅ Adzuna API response received:`
   - Jobs should load

### **Step 4: Test CORS Directly**

```bash
curl -H "Origin: https://jobs.weblibron.com" \
     "https://api.weblibron.com/api/adzuna/jobs?country=us&resultsPerPage=5"
```

**Should return:**
- Status: 200 OK
- Headers: `Access-Control-Allow-Origin: https://jobs.weblibron.com`
- JSON data with jobs

## **Also Required: Adzuna Credentials**

While you're in the Environment tab, also add:

```
Key: ADZUNA_APP_ID
Value: 06d3c968

Key: ADZUNA_APP_KEY
Value: 99a383380cda28c24599ebc95e220c4d
```

## **Complete Environment Variables Checklist:**

Add these to Render → Environment tab:

```env
# ✅ REQUIRED - CORS
FRONTEND_URL=https://jobs.weblibron.com

# ✅ REQUIRED - Adzuna API
ADZUNA_APP_ID=06d3c968
ADZUNA_APP_KEY=99a383380cda28c24599ebc95e220c4d

# ✅ REQUIRED - Backend URL
BACKEND_URL=https://api.weblibron.com

# ✅ REQUIRED - Database
MONGO_URI=your-mongodb-connection-string

# ✅ REQUIRED - Authentication
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# ✅ REQUIRED - Server
PORT=10000
NODE_ENV=production
```

## **After Adding Variables:**

1. ✅ Backend auto-restarts
2. ✅ Check logs for CORS configuration
3. ✅ Test endpoint with Origin header
4. ✅ Frontend should now work

## **Troubleshooting:**

### **Still Getting Error?**

1. **Check Backend Logs:**
   - Render Dashboard → Logs
   - Look for: `❌ CORS blocked origin: https://jobs.weblibron.com`
   - If you see this, `FRONTEND_URL` is not set correctly

2. **Verify Environment Variable:**
   - Render Dashboard → Environment tab
   - Check `FRONTEND_URL` value is exactly: `https://jobs.weblibron.com`
   - No trailing slash
   - No quotes

3. **Check Backend Restarted:**
   - Look for restart in Events tab
   - Check logs show new CORS configuration

4. **Clear Browser Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or try incognito/private mode

---

**Status:** ✅ **Add `FRONTEND_URL=https://jobs.weblibron.com` to Render environment variables to fix the connection error.**

