# 🔧 Add Environment Variables to Render - STEP BY STEP

## **Current Status:**
✅ Backend is deployed on Render  
❌ Adzuna credentials are NOT configured  
❌ Jobs endpoint returns 500 error

## **Quick Fix - Add Environment Variables:**

### **Step 1: Go to Render Dashboard**
1. Open: https://dashboard.render.com
2. Sign in to your account
3. Find your backend service (should be named something like "job-portal-backend")

### **Step 2: Open Environment Tab**
1. Click on your backend service
2. Click on **"Environment"** tab (in the left sidebar)
3. You'll see a list of environment variables

### **Step 3: Add Required Variables**

Click **"Add Environment Variable"** for each of these:

#### **1. Adzuna API Credentials (REQUIRED)**
```
Key: ADZUNA_APP_ID
Value: 06d3c968
```
Click **"Save Changes"**

```
Key: ADZUNA_APP_KEY
Value: 99a383380cda28c24599ebc95e220c4d
```
Click **"Save Changes"**

#### **2. CORS Configuration (REQUIRED)**
```
Key: FRONTEND_URL
Value: https://jobs.weblibron.com
```
Click **"Save Changes"**

#### **3. Backend URL (REQUIRED)**
```
Key: BACKEND_URL
Value: https://api.weblibron.com
```
Click **"Save Changes"**

#### **4. Database (REQUIRED - if not already set)**
```
Key: MONGO_URI
Value: mongodb+srv://job:QmhuXtWi4KTRq6X3@cluster0.bkj5bcg.mongodb.net/
```
Click **"Save Changes"**

```
Key: MONGODB_URI
Value: mongodb+srv://job:QmhuXtWi4KTRq6X3@cluster0.bkj5bcg.mongodb.net/
```
Click **"Save Changes"**

#### **5. Authentication (REQUIRED - if not already set)**
```
Key: JWT_SECRET
Value: 25d62df4f092f330d99303a183f0f56610ca752afb340d123f25b7e873af1d3454e382e4b8aaaecafb2f3b11f3bee2098d09e6edd744787131a1b042550cf06a
```
Click **"Save Changes"**

```
Key: SESSION_SECRET
Value: 25d62df4f092f330d99303a183f0f56610ca752afb340d123f25b7e873af1d3454e382e4b8aaaecafb2f3b11f3bee2098d09e6edd744787131a1b042550cf06a
```
Click **"Save Changes"**

#### **6. Server Configuration (REQUIRED)**
```
Key: PORT
Value: 10000
```
Click **"Save Changes"**

```
Key: NODE_ENV
Value: production
```
Click **"Save Changes"**

### **Step 4: Restart Backend**

After adding all variables:
1. Go to **"Events"** tab
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
   OR
3. The service will auto-restart when you save environment variables

### **Step 5: Verify It's Working**

Wait 1-2 minutes for restart, then test:

```bash
# Test Adzuna credentials
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

```bash
# Test Adzuna jobs
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

---

## **Visual Guide:**

```
Render Dashboard
├── Your Backend Service
    ├── Environment (tab)
    │   ├── [Add Environment Variable]
    │   │   ├── Key: ADZUNA_APP_ID
    │   │   └── Value: 06d3c968
    │   │   └── [Save Changes]
    │   │
    │   ├── [Add Environment Variable]
    │   │   ├── Key: ADZUNA_APP_KEY
    │   │   └── Value: 99a383380cda28c24599ebc95e220c4d
    │   │   └── [Save Changes]
    │   │
    │   └── ... (repeat for all variables)
    │
    └── Events (tab)
        └── [Manual Deploy] → [Deploy latest commit]
```

---

## **Important Notes:**

1. **No spaces** around the `=` sign in Render
2. **No quotes** needed around values
3. **Case sensitive** - Use exact variable names
4. **Auto-restart** - Backend restarts automatically when you save
5. **Check logs** - Go to "Logs" tab to see if there are any errors

---

## **After Adding Variables:**

1. ✅ Backend will auto-restart
2. ✅ Check "Logs" tab for any errors
3. ✅ Test endpoints (see Step 5 above)
4. ✅ Frontend should now be able to fetch data

---

**Status:** ⚠️ **Action Required** - Add environment variables to Render dashboard

