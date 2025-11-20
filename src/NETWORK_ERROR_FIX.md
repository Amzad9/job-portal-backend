# 🔧 Network Error Fix - ERR_NETWORK

## **Error:**
```json
{
  "message": "Network Error",
  "code": "ERR_NETWORK",
  "url": "https://api.weblibron.com/api/jobs"
}
```

## **Possible Causes:**

### **1. CORS Not Configured**
**Symptom:** Browser blocks the request due to CORS policy

**Fix:**
1. Go to Render Dashboard → Backend Service → Environment
2. Add:
   ```env
   FRONTEND_URL=https://jobs.weblibron.com
   ```
3. Restart backend

### **2. Backend Not Responding**
**Symptom:** Backend is down or not accessible

**Check:**
```bash
curl https://api.weblibron.com/api/jobs?limit=5
```

**Fix:**
- Check Render dashboard if backend is running
- Check backend logs for errors
- Verify backend URL is correct

### **3. SSL/HTTPS Certificate Issue**
**Symptom:** Certificate mismatch or invalid

**Check:**
```bash
curl -v https://api.weblibron.com/api/jobs
```

**Fix:**
- Verify SSL certificate is valid
- Check certificate expiration date

### **4. Network Connectivity**
**Symptom:** Cannot reach the server

**Check:**
```bash
ping api.weblibron.com
nslookup api.weblibron.com
```

**Fix:**
- Check DNS settings
- Verify domain is pointing to correct IP
- Check firewall rules

## **Quick Fixes:**

### **Fix 1: Verify CORS Configuration**

**Backend Environment Variables (Render):**
```env
FRONTEND_URL=https://jobs.weblibron.com
```

**Test CORS:**
```bash
curl -H "Origin: https://jobs.weblibron.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     "https://api.weblibron.com/api/jobs" \
     -v
```

Should return:
```
Access-Control-Allow-Origin: https://jobs.weblibron.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
```

### **Fix 2: Check Backend Logs**

1. Go to Render Dashboard → Backend Service → Logs
2. Look for:
   - `⚠️  CORS blocked origin: https://jobs.weblibron.com`
   - `✅ MongoDB Connected`
   - `Server running on port ...`
   - Any error messages

### **Fix 3: Test Endpoint Directly**

```bash
# Test without CORS (server-side)
curl "https://api.weblibron.com/api/jobs?limit=5"

# Test with CORS headers
curl -H "Origin: https://jobs.weblibron.com" \
     "https://api.weblibron.com/api/jobs?limit=5"
```

### **Fix 4: Frontend Environment Variable**

**Verify in Vercel (Frontend):**
```env
NEXT_PUBLIC_API_URL=https://api.weblibron.com
```

**Test in Browser Console:**
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
// Should show: https://api.weblibron.com
```

## **Debugging Steps:**

### **1. Check Browser Console:**
- Open DevTools (F12) → Console
- Look for CORS errors
- Look for network errors

### **2. Check Network Tab:**
- Open DevTools → Network tab
- Find the failed request
- Check:
  - **Status Code** (might be blank if CORS blocked)
  - **Response Headers** (should have CORS headers)
  - **Request Headers** (should have Origin header)

### **3. Check Backend Logs:**
- Render Dashboard → Logs
- Look for CORS warnings
- Look for request logs

## **Common Solutions:**

### **Solution 1: Add FRONTEND_URL to Backend**
```env
FRONTEND_URL=https://jobs.weblibron.com
```
→ Restart backend

### **Solution 2: Verify Backend is Running**
- Check Render dashboard
- Verify service status is "Live"
- Check recent deployments

### **Solution 3: Clear Browser Cache**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Try incognito/private mode

### **Solution 4: Check DNS**
```bash
nslookup api.weblibron.com
```
Should resolve to Render IP addresses

---

## **After Fixing:**

1. ✅ Test endpoint: `curl https://api.weblibron.com/api/jobs?limit=5`
2. ✅ Test CORS: Use curl with Origin header
3. ✅ Check browser console - should see successful requests
4. ✅ Check Network tab - status should be 200

---

**Status:** ✅ Frontend updated to use axios. **Check CORS configuration in backend.**

