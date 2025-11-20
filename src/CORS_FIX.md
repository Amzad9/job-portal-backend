# 🔧 CORS Fix for Adzuna Jobs Endpoint

## **Issue:** 
Request to `https://api.weblibron.com/api/adzuna/jobs` shows no status code (likely CORS blocked)

## **Root Cause:**
The frontend at `https://jobs.weblibron.com` is making requests to `https://api.weblibron.com`, but the backend CORS configuration might not allow this origin.

## **Fix:**

### **1. Update Backend Environment Variable**

In your backend `.env` file (or Render environment variables), set:

```env
FRONTEND_URL=https://jobs.weblibron.com
```

Or if you have multiple frontend domains:

```env
FRONTEND_URL=https://jobs.weblibron.com,https://www.weblibron.com
```

### **2. Restart Backend**

After updating the environment variable, restart your backend server.

### **3. Verify CORS is Working**

Test the endpoint with CORS headers:

```bash
curl -H "Origin: https://jobs.weblibron.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     "https://api.weblibron.com/api/adzuna/jobs" \
     -v
```

Should return `Access-Control-Allow-Origin: https://jobs.weblibron.com`

## **Debugging:**

### **Check Backend Logs:**

Look for these messages:
- `⚠️  CORS blocked origin: https://jobs.weblibron.com` - CORS is blocking
- `📋 Allowed origins:` - Shows what origins are allowed
- `🌐 FRONTEND_URL env:` - Shows the environment variable value

### **Check Browser Console:**

1. Open DevTools (F12)
2. Go to Console tab
3. Look for CORS errors like:
   - `Access to XMLHttpRequest ... has been blocked by CORS policy`
   - `No 'Access-Control-Allow-Origin' header is present`

### **Check Network Tab:**

1. Open DevTools → Network tab
2. Find the request to `/api/adzuna/jobs`
3. Check:
   - **Status Code**: Should be 200 (not blank)
   - **Response Headers**: Should include `Access-Control-Allow-Origin`
   - **Request Headers**: Should include `Origin: https://jobs.weblibron.com`

## **Quick Test:**

Test if the endpoint works without CORS (server-side):

```bash
curl "https://api.weblibron.com/api/adzuna/jobs?country=us&resultsPerPage=10&page=1"
```

Should return JSON with `{"success":true,"jobs":[...]}`

## **If Still Not Working:**

1. **Verify environment variable is set:**
   - Check Render dashboard → Environment tab
   - Ensure `FRONTEND_URL` is set correctly
   - No trailing slashes

2. **Check backend is using the env var:**
   - Backend logs should show allowed origins on startup
   - Or check with: `console.log(process.env.FRONTEND_URL)`

3. **Try adding wildcard (temporary for testing):**
   ```javascript
   // In server.js (NOT recommended for production)
   origin: "*" // Allows all origins
   ```

---

**Status:** ✅ Enhanced CORS logging added. Update `FRONTEND_URL` environment variable.

