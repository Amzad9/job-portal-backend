# 🔧 CORS 403 Forbidden Fix

## **Error:**
```
Request URL: https://api.weblibron.com/api/adzuna/jobs?country=us&resultsPerPage=10&page=1
Status Code: 403 Forbidden
```

## **Root Cause:**
The backend is blocking the request because the origin `https://jobs.weblibron.com` is not in the allowed CORS origins list.

## **Fix:**

### **Step 1: Add FRONTEND_URL to Render Environment Variables**

1. Go to **Render Dashboard** → **Your Backend Service**
2. Click **"Environment"** tab
3. Add this variable:

```
Key: FRONTEND_URL
Value: https://jobs.weblibron.com
```

4. Click **"Save Changes"**
5. Backend will auto-restart (wait 1-2 minutes)

### **Step 2: Verify CORS is Working**

After restart, test:

```bash
curl -H "Origin: https://jobs.weblibron.com" \
     -v "https://api.weblibron.com/api/adzuna/jobs?country=us&resultsPerPage=5"
```

**Should return:**
- Status: 200 OK
- Headers include: `Access-Control-Allow-Origin: https://jobs.weblibron.com`

### **Step 3: Check Backend Logs**

Go to Render Dashboard → Logs tab, you should see:

```
🌐 CORS Configuration:
   FRONTEND_URL: https://jobs.weblibron.com
   Allowed origins: [ 'https://jobs.weblibron.com' ]
   NODE_ENV: production
```

When a request comes in:
```
✅ CORS: Allowing origin: https://jobs.weblibron.com
```

## **Multiple Frontend Domains:**

If you have multiple frontend domains, add them separated by commas:

```
Key: FRONTEND_URL
Value: https://jobs.weblibron.com,https://www.weblibron.com,https://weblibron.com
```

## **Testing:**

### **Test 1: Direct Request (No CORS)**
```bash
curl "https://api.weblibron.com/api/adzuna/jobs?country=us&resultsPerPage=5"
```
Should work (no origin header)

### **Test 2: With Origin Header (CORS)**
```bash
curl -H "Origin: https://jobs.weblibron.com" \
     "https://api.weblibron.com/api/adzuna/jobs?country=us&resultsPerPage=5"
```
Should work and return CORS headers

### **Test 3: Wrong Origin (Should Fail)**
```bash
curl -H "Origin: https://example.com" \
     "https://api.weblibron.com/api/adzuna/jobs?country=us&resultsPerPage=5"
```
Should return 403 or CORS error

## **Backend Logs to Check:**

After adding `FRONTEND_URL`, check logs for:

**On Startup:**
```
🌐 CORS Configuration:
   FRONTEND_URL: https://jobs.weblibron.com
   Allowed origins: [ 'https://jobs.weblibron.com' ]
```

**On Request:**
```
✅ CORS: Allowing origin: https://jobs.weblibron.com
```

**If Blocked (before fix):**
```
❌ CORS blocked origin: https://jobs.weblibron.com
📋 Allowed origins: [ 'http://localhost:3000' ]
🌐 FRONTEND_URL env: undefined
```

## **Common Issues:**

### **Issue 1: Environment Variable Not Set**
**Symptom:** Logs show `FRONTEND_URL: not set`

**Fix:** Add `FRONTEND_URL` to Render environment variables

### **Issue 2: Wrong Value**
**Symptom:** Logs show wrong origin in allowed list

**Fix:** 
- Check for typos: `https://jobs.weblibron.com` (no trailing slash)
- Check for `http://` vs `https://` mismatch

### **Issue 3: Backend Not Restarted**
**Symptom:** Changes not taking effect

**Fix:**
- Wait 1-2 minutes for auto-restart
- Or manually trigger deploy in Render

## **Quick Checklist:**

- [ ] `FRONTEND_URL` added to Render environment variables
- [ ] Value is exactly: `https://jobs.weblibron.com` (no trailing slash)
- [ ] Backend restarted (check logs)
- [ ] CORS logs show correct allowed origins
- [ ] Test request works with Origin header
- [ ] Browser requests now return 200 instead of 403

---

**Status:** ✅ Enhanced CORS logging added. **Add `FRONTEND_URL` to Render environment variables to fix 403 error.**

