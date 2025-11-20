# 🔧 Fix: Google OAuth redirect_uri_mismatch Error

## ❌ **Error:**
```
Error 400: redirect_uri_mismatch
```

## 🔍 **Problem:**
The callback URL in your Google Cloud Console doesn't match what your app is sending.

**Your app is using:**
```
http://localhost:5001/api/auth/google/callback
```

**But Google Console might have:**
```
http://localhost:5000/api/auth/google/callback
```

## ✅ **Solution: Add the Correct Redirect URI to Google Console**

### **Step 1: Go to Google Cloud Console**

1. Visit: https://console.cloud.google.com/
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID (the one with Client ID: `1017917944371-c919rkmicfi35vs034lh5q6543ckojbl`)

### **Step 2: Add Authorized Redirect URIs**

In the **Authorized redirect URIs** section, make sure you have **BOTH** of these:

```
http://localhost:5000/api/auth/google/callback
http://localhost:5001/api/auth/google/callback
```

**Why both?** 
- Port 5000 is the default
- Port 5001 is what your server is currently using

### **Step 3: Save**

1. Click **ADD URI** for each one
2. Click **SAVE** at the bottom

### **Step 4: Wait 1-2 Minutes**

Google sometimes takes a minute to update the redirect URIs.

### **Step 5: Test Again**

1. Restart your backend server (if needed)
2. Try Google login again
3. It should work now! ✅

---

## 🎯 **Alternative: Use Port 5000 Instead**

If you prefer to use port 5000 (the default), update your `.env`:

```env
PORT=5000
BACKEND_URL=http://localhost:5000
```

Then make sure Google Console has:
```
http://localhost:5000/api/auth/google/callback
```

---

## 📋 **Quick Checklist**

- [ ] Added `http://localhost:5001/api/auth/google/callback` to Google Console
- [ ] Added `http://localhost:5000/api/auth/google/callback` to Google Console (for safety)
- [ ] Clicked **SAVE** in Google Console
- [ ] Waited 1-2 minutes for changes to propagate
- [ ] Restarted backend server
- [ ] Tested Google login again

---

## 🚨 **Still Not Working?**

1. **Double-check the exact URL:**
   - No trailing slashes
   - Exact port number
   - `http://` not `https://` for localhost

2. **Check your `.env` file:**
   ```bash
   grep BACKEND_URL .env
   grep PORT .env
   ```

3. **Verify the callback URL being sent:**
   - Check browser network tab
   - Look for the `redirect_uri` parameter in the Google OAuth URL

4. **Clear browser cache** and try again

---

**Status:** ✅ Fix instructions provided

