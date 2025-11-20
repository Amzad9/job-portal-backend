# ✅ Adzuna API Credentials Setup - URGENT

## **Current Error:**
```
Adzuna API credentials not configured
```

## **Status:**
- ✅ Frontend is deployed and working
- ✅ Frontend is connecting to backend correctly
- ❌ Backend Adzuna credentials are NOT set in Render

## **IMMEDIATE FIX:**

### **Step 1: Go to Render Dashboard**
1. Open: https://dashboard.render.com
2. Sign in
3. Find your **backend service** (not frontend)

### **Step 2: Add Environment Variables**

Click on your backend service → **"Environment"** tab → Add these:

#### **1. Adzuna App ID:**
```
Key: ADZUNA_APP_ID
Value: 06d3c968
```
Click **"Save Changes"**

#### **2. Adzuna App Key:**
```
Key: ADZUNA_APP_KEY
Value: 99a383380cda28c24599ebc95e220c4d
```
Click **"Save Changes"**

#### **3. Frontend URL (for CORS):**
```
Key: FRONTEND_URL
Value: https://jobs.weblibron.com
```
Click **"Save Changes"**

### **Step 3: Wait for Restart**

- Backend will auto-restart (1-2 minutes)
- Check **"Logs"** tab to see restart progress

### **Step 4: Verify It's Working**

After restart, test:

```bash
curl https://api.weblibron.com/api/adzuna/test
```

**Should return:**
```json
{
  "success": true,
  "configured": true,
  "hasAppId": true,
  "hasAppKey": true
}
```

Then test jobs:

```bash
curl "https://api.weblibron.com/api/adzuna/jobs?country=us&resultsPerPage=5"
```

**Should return:**
```json
{
  "success": true,
  "jobs": [...],
  "count": 5
}
```

## **Complete Environment Variables Checklist:**

Add ALL of these to Render → Backend Service → Environment:

```env
# ✅ REQUIRED - Adzuna API
ADZUNA_APP_ID=06d3c968
ADZUNA_APP_KEY=99a383380cda28c24599ebc95e220c4d

# ✅ REQUIRED - CORS
FRONTEND_URL=https://jobs.weblibron.com

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

1. ✅ Backend restarts automatically
2. ✅ Check logs for: `✅ Successfully fetched X jobs from Adzuna`
3. ✅ Frontend will show jobs instead of error
4. ✅ "Jobs from Adzuna" section will display jobs

## **Quick Test:**

After adding credentials, refresh: https://jobs.weblibron.com

The "Jobs from Adzuna" section should show jobs instead of the error message.

---

**Status:** ⚠️ **URGENT** - Add `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` to Render backend environment variables NOW.

