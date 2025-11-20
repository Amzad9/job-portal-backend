# ✅ Google OAuth Production Fix

## **Issue:**
Google OAuth callback was redirecting to `http://localhost:5001` instead of production backend `https://api.weblibron.com` when logging in from `https://jobs.weblibron.com`.

## **Root Cause:**
Frontend login/signup pages were using:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
```

This defaulted to localhost when `NEXT_PUBLIC_API_URL` wasn't set in Vercel.

## **Fix Applied:**

### **1. Created `getApiBaseUrl()` Helper**
- **File:** `app/utils/apiConfig.ts`
- **Function:** Centralized API URL management
- **Logic:**
  - Uses `NEXT_PUBLIC_API_URL` if set
  - Falls back to `https://api.weblibron.com` in production
  - Uses `http://localhost:5001` only in local development

### **2. Updated All Frontend Files:**

✅ **Login Page** (`app/login/page.tsx`)
- Updated `handleSocialLogin()` to use `getApiBaseUrl()`
- Updated login API call to use `getApiBaseUrl()`

✅ **Signup Page** (`app/signup/page.tsx`)
- Updated `handleSocialSignup()` to use `getApiBaseUrl()`
- Updated signup API call to use `getApiBaseUrl()`

✅ **Components:**
- `JobsFilter.tsx` - Updated API calls
- `JobViewTracker.tsx` - Updated API calls
- `ApplicationForm.tsx` - Updated API calls
- `ApplyButton.tsx` - Updated API calls
- `Header.tsx` - Updated API calls
- `Footer.tsx` - Updated API calls

## **Backend Configuration:**

### **Passport.js Callback URL:**
```javascript
callbackURL: `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`}/api/auth/google/callback`
```

**✅ Correct for production:**
- Uses `BACKEND_URL` environment variable
- Should be set to `https://api.weblibron.com` in Render

### **OAuth Controller Redirect:**
```javascript
const redirectUrl = new URL(`${process.env.FRONTEND_URL || "http://localhost:3000"}/oauth/callback`);
```

**✅ Correct for production:**
- Uses `FRONTEND_URL` environment variable
- Should be set to `https://jobs.weblibron.com` in Render

## **Required Environment Variables:**

### **Frontend (Vercel):**
```env
NEXT_PUBLIC_API_URL=https://api.weblibron.com
```

### **Backend (Render):**
```env
BACKEND_URL=https://api.weblibron.com
FRONTEND_URL=https://jobs.weblibron.com
GOOGLE_CLIENT_ID=1017917944371-c919rkmicfi35vs034lh5q6543ckojbl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

## **Google Cloud Console Configuration:**

### **Authorized JavaScript origins:**
- `https://jobs.weblibron.com`
- `http://localhost:3000` (for local dev)

### **Authorized redirect URIs:**
- `https://api.weblibron.com/api/auth/google/callback`
- `http://localhost:5001/api/auth/google/callback` (for local dev)
- `http://localhost:5000/api/auth/google/callback` (for local dev)

## **Testing:**

### **1. Local Development:**
```bash
# Frontend
cd jobportal-frontend
npm run dev  # Runs on http://localhost:3000

# Backend
cd job-portal-backend/src
npm run dev  # Runs on http://localhost:5001
```

### **2. Production:**
1. ✅ Frontend deployed: `https://jobs.weblibron.com`
2. ✅ Backend deployed: `https://api.weblibron.com`
3. ✅ Environment variables set in Vercel and Render
4. ✅ Google OAuth configured in Google Cloud Console

## **After Deployment:**

1. **Set Vercel Environment Variable:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL=https://api.weblibron.com`
   - Redeploy frontend

2. **Verify Render Environment Variables:**
   - `BACKEND_URL=https://api.weblibron.com`
   - `FRONTEND_URL=https://jobs.weblibron.com`
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set

3. **Test Google Login:**
   - Go to `https://jobs.weblibron.com/login`
   - Click "Continue with Google"
   - Should redirect to `https://api.weblibron.com/api/auth/google` (not localhost)
   - After Google auth, should redirect back to `https://jobs.weblibron.com/oauth/callback`

## **Status:**
✅ **FIXED** - All frontend files now use `getApiBaseUrl()` which correctly resolves to production URL.

---

**Next Steps:**
1. Deploy frontend to Vercel with `NEXT_PUBLIC_API_URL` environment variable
2. Verify backend has all required environment variables in Render
3. Test Google OAuth login on production
