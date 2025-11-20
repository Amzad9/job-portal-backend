# 🔧 Production OAuth Setup

## 🌐 **Production URLs:**

- **Frontend:** `https://jobs.weblibron.com` ✅
- **OAuth Callback:** `https://jobs.weblibron.com/oauth/callback` ✅
- **Vercel Deployment:** Configured for `jobs.weblibron.com`

## ✅ **Step 1: Update Backend Environment Variables**

In your **production backend** environment (Vercel, Railway, etc.), set:

```env
FRONTEND_URL=https://jobs.weblibron.com
BACKEND_URL=https://your-backend-domain.com  # Your actual backend URL
```

## ✅ **Step 2: Add to Google OAuth Console**

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com/
   - Select your project
   - Go to **APIs & Services** → **Credentials**
   - Click on your OAuth 2.0 Client ID

2. **Add Authorized Redirect URIs:**

   Add **ALL** of these redirect URIs:

   **Production:**
   ```
   https://jobs.weblibron.com/oauth/callback
   ```

   **Development (keep these):**
   ```
   http://localhost:3000/oauth/callback
   http://localhost:5000/api/auth/google/callback
   http://localhost:5001/api/auth/google/callback
   ```

3. **Click SAVE**

4. **Wait 1-2 minutes** for changes to propagate

## ✅ **Step 3: Update Backend Callback URL**

The backend is already configured to use `FRONTEND_URL` from environment variables. Make sure your production backend has:

```env
FRONTEND_URL=https://jobs.weblibron.com
```

This will automatically set the callback redirect to:
```
https://jobs.weblibron.com/oauth/callback
```

## ✅ **Step 4: Verify Setup**

### **Check Backend Configuration:**

The backend callback URL is built from `FRONTEND_URL`:
```javascript
callbackURL: `${process.env.FRONTEND_URL}/oauth/callback`
```

So if `FRONTEND_URL=https://jobs.weblibron.com`, it will redirect to:
```
https://jobs.weblibron.com/oauth/callback
```

### **Test Production OAuth:**

1. Visit: `https://jobs.weblibron.com/login`
2. Click "Sign in with Google"
3. Complete Google authentication
4. Should redirect to: `https://jobs.weblibron.com/oauth/callback?token=...`
5. Should work! ✅

## 📋 **Complete Redirect URI List for Google Console:**

```
https://jobs.weblibron.com/oauth/callback
http://localhost:3000/oauth/callback
http://localhost:5000/api/auth/google/callback
http://localhost:5001/api/auth/google/callback
```

## ⚠️ **Important Notes:**

1. **No trailing slashes** in redirect URIs
2. **Exact match required** - Google is case-sensitive
3. **Wait 1-2 minutes** after saving in Google Console
4. **HTTPS required** for production URLs
5. **HTTP only** for localhost development

## 🔒 **Security:**

- ✅ Production uses HTTPS
- ✅ OAuth tokens are secure
- ✅ Callback URL is whitelisted in Google Console

---

**Status:** ✅ Configuration ready - Add to Google Console

