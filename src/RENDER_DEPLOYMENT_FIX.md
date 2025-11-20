# 🔧 Fix: Render Backend Deployment Error

## ❌ **Error:**
```
Service Root Directory "/opt/render/project/src/job-portal-backend" is missing.
```

## 🔍 **Problem:**
Render is looking for your backend in `/opt/render/project/src/job-portal-backend` but it doesn't exist in that location.

## ✅ **Solution: Fix Root Directory in Render**

### **Step 1: Go to Render Dashboard**

1. Visit: https://dashboard.render.com/
2. Select your **Backend Service** (not frontend)

### **Step 2: Update Root Directory**

1. Click on **Settings** tab
2. Scroll to **"Build & Deploy"** section
3. Find **"Root Directory"** field

### **Step 3: Set Correct Root Directory**

**Option A: If your repository structure is:**
```
your-repo/
  ├── job-portal-backend/  ← package.json is here
  │   ├── package.json
  │   ├── server.js
  │   └── ...
  └── jobportal-frontend/
```

**Then set Root Directory to:** `job-portal-backend`

**Option B: If your backend IS the repository root:**
```
job-portal-backend/
  ├── package.json  ← package.json is here
  ├── server.js
  └── ...
```

**Then set Root Directory to:** `.` (dot) or leave it **EMPTY**

### **Step 4: Verify Build & Start Commands**

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

**OR if you set root directory to `job-portal-backend`:**
```
cd job-portal-backend && npm install
cd job-portal-backend && npm start
```

### **Step 5: Set Environment Variables**

Go to **Environment** tab and add all required variables:

```env
NODE_ENV=production
NODE_VERSION=20.x
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-minimum-32-characters
JWT_EXPIRE=30d
FRONTEND_URL=https://jobs.weblibron.com
BACKEND_URL=https://your-backend-service.onrender.com
GOOGLE_CLIENT_ID=1017917944371-c919rkmicfi35vs034lh5q6543ckojbl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
SESSION_SECRET=your-session-secret-minimum-32-characters
ADZUNA_APP_ID=06d3c968
ADZUNA_APP_KEY=99a383380cda28c24599ebc95e220c4d
PORT=10000
```

### **Step 6: Check Service Type**

Make sure your service is configured as:
- **Type:** Web Service (not Static Site)
- **Environment:** Node

### **Step 7: Save and Redeploy**

1. Click **Save Changes**
2. Go to **Manual Deploy** → **Deploy latest commit**
3. Or push a new commit to trigger auto-deploy

## 🔍 **How to Determine Your Repository Structure:**

### **If you have a monorepo** (both frontend and backend):
```
your-repo/
  ├── job-portal-backend/
  │   ├── package.json
  │   └── server.js
  └── jobportal-frontend/
      ├── package.json
      └── ...
```

**Backend Root Directory:** `job-portal-backend`  
**Frontend Root Directory:** `jobportal-frontend`

### **If you have separate repositories:**
```
job-portal-backend/  (separate repo)
  ├── package.json
  └── server.js
```

**Backend Root Directory:** `.` or empty

## 📋 **Quick Checklist:**

- [ ] Root Directory is set correctly (NOT `src/job-portal-backend`)
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] All environment variables are set
- [ ] Service type is "Web Service"
- [ ] Environment is "Node"
- [ ] Branch is correct (usually `main`)

## 🚨 **Common Mistakes:**

1. **Root Directory set to `src/job-portal-backend`** → Should be `job-portal-backend` or `.`
2. **Wrong service type** → Should be "Web Service", not "Static Site"
3. **Missing environment variables** → Check all required vars are set
4. **Wrong branch** → Make sure it's `main` or your default branch

## 🔗 **Related Files:**

- Check `package.json` for start script
- Verify `server.js` exists in the root directory
- Make sure all dependencies are in `package.json`

---

**After fixing, your backend deployment should work!** ✅

