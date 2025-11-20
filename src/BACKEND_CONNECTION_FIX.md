# 🔧 Backend Connection Error Fix

## **Error:**
```
Cannot connect to server at https://api.weblibron.com. 
Please check if the backend is running.
```

## **Possible Causes:**

### **1. Backend Not Running**
**Check:**
1. Go to Render Dashboard → Your Backend Service
2. Check service status (should be "Live")
3. Check "Logs" tab for errors
4. Check if service crashed or stopped

**Fix:**
- Restart the service in Render
- Check logs for startup errors
- Verify environment variables are set

### **2. Wrong Backend URL**
**Check:**
- Verify `NEXT_PUBLIC_API_URL` in frontend (Vercel)
- Should be: `https://api.weblibron.com`
- No trailing slash

**Fix:**
- Update environment variable in Vercel
- Redeploy frontend

### **3. DNS/Network Issue**
**Check:**
```bash
ping api.weblibron.com
nslookup api.weblibron.com
```

**Fix:**
- Verify DNS is pointing to Render
- Check domain configuration

### **4. SSL/Certificate Issue**
**Check:**
```bash
curl -v https://api.weblibron.com/api/adzuna/test
```

**Fix:**
- Verify SSL certificate is valid
- Check certificate expiration

## **Quick Diagnostic Steps:**

### **Step 1: Test Backend Directly**
```bash
curl https://api.weblibron.com/api/adzuna/test
```

**Expected:** JSON response with `{"success":true,...}`

**If fails:**
- Backend is down
- Check Render dashboard
- Check backend logs

### **Step 2: Test from Browser**
1. Open: `https://api.weblibron.com/api/adzuna/test`
2. Should see JSON response

**If fails:**
- Backend is not accessible
- Check Render service status

### **Step 3: Check Render Logs**
1. Render Dashboard → Backend Service → Logs
2. Look for:
   - `✅ MongoDB Connected`
   - `Server running on port ...`
   - `🌐 CORS Configuration:`
   - Any error messages

### **Step 4: Verify Environment Variables**
In Render Dashboard → Environment tab, check:
- `FRONTEND_URL=https://jobs.weblibron.com`
- `ADZUNA_APP_ID=06d3c968`
- `ADZUNA_APP_KEY=99a383380cda28c24599ebc95e220c4d`
- `MONGO_URI=...`
- `PORT=10000` (or your Render port)

## **Common Solutions:**

### **Solution 1: Restart Backend**
1. Render Dashboard → Backend Service
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment to complete

### **Solution 2: Check Service Status**
1. Render Dashboard → Backend Service
2. Verify status is "Live" (not "Stopped" or "Error")
3. If stopped, click "Start"

### **Solution 3: Check Logs for Errors**
1. Render Dashboard → Logs tab
2. Look for:
   - MongoDB connection errors
   - Port binding errors
   - Environment variable errors
   - Application crashes

### **Solution 4: Verify Domain Configuration**
1. Check DNS settings
2. Verify `api.weblibron.com` points to Render
3. Check SSL certificate is valid

## **Frontend Environment Variable:**

**In Vercel (Frontend):**
```env
NEXT_PUBLIC_API_URL=https://api.weblibron.com
```

**Verify:**
- No trailing slash
- Correct protocol (https)
- Correct domain

## **Backend Health Check:**

Create a simple health check endpoint to verify backend is running:

```javascript
// In server.js
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

Test:
```bash
curl https://api.weblibron.com/health
```

## **Debugging Checklist:**

- [ ] Backend service is "Live" in Render
- [ ] Backend logs show no errors
- [ ] `curl https://api.weblibron.com/api/adzuna/test` works
- [ ] Frontend `NEXT_PUBLIC_API_URL` is correct
- [ ] DNS resolves correctly
- [ ] SSL certificate is valid
- [ ] No firewall blocking requests
- [ ] Backend environment variables are set

---

**Status:** ✅ Enhanced error messages added. **Check Render dashboard to verify backend is running.**

