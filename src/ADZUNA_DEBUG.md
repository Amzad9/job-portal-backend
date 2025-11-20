# 🔍 Adzuna Jobs Debugging Guide

## **Issue:** Adzuna jobs not fetching with `NEXT_PUBLIC_API_URL=https://api.weblibron.com`

## **Possible Causes:**

### 1. **CORS Configuration**
**Problem:** Frontend origin (`https://jobs.weblibron.com`) not in allowed CORS origins.

**Solution:** 
- Add `https://jobs.weblibron.com` to `FRONTEND_URL` in backend `.env`:
  ```env
  FRONTEND_URL=https://jobs.weblibron.com
  ```
- Or add multiple origins:
  ```env
  FRONTEND_URL=https://jobs.weblibron.com,https://www.weblibron.com
  ```

### 2. **Backend Not Running**
**Problem:** Backend API not accessible at `https://api.weblibron.com`.

**Check:**
- Verify backend is deployed and running
- Test endpoint: `https://api.weblibron.com/api/adzuna/test`
- Should return: `{"success":true,"configured":true,...}`

### 3. **Environment Variables**
**Problem:** Adzuna credentials not set in production.

**Check:**
- `ADZUNA_APP_ID` is set
- `ADZUNA_APP_KEY` is set
- Test: `https://api.weblibron.com/api/adzuna/test`

### 4. **Network/Timeout Issues**
**Problem:** Adzuna API taking too long or network issues.

**Check:**
- Backend logs for timeout errors
- Adzuna API status
- Network connectivity from backend server

## **Debugging Steps:**

### **Step 1: Test Backend Endpoint**
```bash
curl https://api.weblibron.com/api/adzuna/test
```

Expected response:
```json
{
  "success": true,
  "configured": true,
  "hasAppId": true,
  "hasAppKey": true
}
```

### **Step 2: Test Jobs Endpoint**
```bash
curl "https://api.weblibron.com/api/adzuna/jobs?country=us&resultsPerPage=5"
```

### **Step 3: Check Frontend Console**
Open browser console on `https://jobs.weblibron.com` and check:
- Network tab for failed requests
- Console for error messages
- Check request URL and response

### **Step 4: Check Backend Logs**
Look for:
- `📥 Adzuna jobs request received:` - Request received
- `🌐 Calling Adzuna API:` - API call started
- `✅ Successfully fetched X jobs` - Success
- `❌ Error fetching Adzuna jobs:` - Error occurred
- `⚠️ CORS blocked origin:` - CORS issue

## **Common Errors:**

### **Error: "Cannot connect to server"**
- Backend not running
- Wrong API URL
- Network issue

### **Error: "CORS blocked"**
- Frontend origin not in `FRONTEND_URL`
- Check backend logs for blocked origin

### **Error: "Adzuna API credentials not configured"**
- `ADZUNA_APP_ID` or `ADZUNA_APP_KEY` missing
- Check backend environment variables

### **Error: "Adzuna API request timed out"**
- Adzuna API slow or down
- Network issue from backend
- Increase timeout (currently 15s)

## **Quick Fixes:**

1. **Update CORS:**
   ```env
   FRONTEND_URL=https://jobs.weblibron.com
   ```

2. **Verify Backend:**
   - Check backend is running
   - Test `/api/adzuna/test` endpoint

3. **Check Environment:**
   - Verify all env vars are set in production
   - Restart backend after env changes

4. **Check Logs:**
   - Backend logs will show detailed error messages
   - Frontend console will show network errors

---

**Status:** Enhanced error logging added to help diagnose issues

