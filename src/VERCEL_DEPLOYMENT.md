# 🚀 Vercel Deployment Configuration

## 🌐 **Production URLs:**

- **Frontend:** `https://jobs.weblibron.com`
- **Backend:** (Your backend URL - e.g., Railway, Render, etc.)

## ✅ **Step 1: Update Frontend Environment Variables (Vercel)**

In your **Vercel project settings** for the frontend:

1. Go to: https://vercel.com/dashboard
2. Select your project: `jobportal-frontend`
3. Go to **Settings** → **Environment Variables**
4. Add/Update:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## ✅ **Step 2: Update Backend Environment Variables**

In your **backend hosting** (Railway, Render, Vercel, etc.):

```env
FRONTEND_URL=https://jobs.weblibron.com
BACKEND_URL=https://your-backend-url.com
GOOGLE_CLIENT_ID=1017917944371-c919rkmicfi35vs034lh5q6543ckojbl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

## ✅ **Step 3: Update Google OAuth Console**

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com/
   - Select your project
   - Go to **APIs & Services** → **Credentials**
   - Click on your OAuth 2.0 Client ID

2. **Add Authorized Redirect URIs:**

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

## ✅ **Step 4: Update Backend Callback URL**

The backend is already configured to use `FRONTEND_URL` from environment variables. Make sure your production backend has:

```env
FRONTEND_URL=https://jobs.weblibron.com
```

This will automatically set the callback redirect to:
```
https://jobs.weblibron.com/oauth/callback
```

## ✅ **Step 5: Vercel Domain Configuration**

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project
   - Go to **Settings** → **Domains**

2. **Add Custom Domain:**
   - Click **Add Domain**
   - Enter: `jobs.weblibron.com`
   - Follow Vercel's instructions to configure DNS

3. **DNS Configuration:**
   - Add a CNAME record pointing to Vercel
   - Or use Vercel's nameservers if managing DNS through Vercel

## ✅ **Step 6: Verify Deployment**

After deployment:

1. **Test Frontend:**
   - Visit: `https://jobs.weblibron.com`
   - Should load your job portal

2. **Test Google OAuth:**
   - Visit: `https://jobs.weblibron.com/login`
   - Click "Sign in with Google"
   - Should redirect to Google and back to: `https://jobs.weblibron.com/oauth/callback`

3. **Test API Connection:**
   - Check browser console for API calls
   - Verify `NEXT_PUBLIC_API_URL` is set correctly

## 📋 **Complete Environment Variables Checklist**

### **Frontend (Vercel):**
- [ ] `NEXT_PUBLIC_API_URL` - Your backend URL
- [ ] `NEXT_PUBLIC_ADSENSE_CLIENT_ID` - (If using AdSense)

### **Backend (Railway/Render/etc.):**
- [ ] `FRONTEND_URL=https://jobs.weblibron.com`
- [ ] `BACKEND_URL` - Your backend URL
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `MONGODB_URI`
- [ ] `JWT_SECRET`
- [ ] `SESSION_SECRET`
- [ ] `STRIPE_SECRET_KEY` - (If using Stripe)
- [ ] `ADZUNA_APP_ID`
- [ ] `ADZUNA_APP_KEY`

## 🔒 **Security Notes:**

- ✅ Use HTTPS for all production URLs
- ✅ Never commit `.env` files
- ✅ Use strong secrets for JWT and sessions
- ✅ Enable CORS only for your frontend domain

## 🐛 **Troubleshooting:**

### **OAuth Not Working:**
- Check Google Console redirect URIs match exactly
- Verify `FRONTEND_URL` in backend environment
- Check browser console for errors

### **API Calls Failing:**
- Verify `NEXT_PUBLIC_API_URL` in Vercel environment variables
- Check CORS settings on backend
- Verify backend is accessible from frontend domain

### **Domain Not Loading:**
- Check DNS configuration
- Wait for DNS propagation (can take up to 48 hours)
- Verify SSL certificate is active in Vercel

---

**Status:** ✅ Ready for deployment to `jobs.weblibron.com`

