# ✅ Google OAuth Credentials - Ready to Use

## 🔑 Your Google OAuth Credentials

Add these **exact** lines to your backend `.env` file:

```env
GOOGLE_CLIENT_ID=1017917944371-c919rkmicfi35vs034lh5q6543ckojbl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

## 📝 Quick Setup

1. **Open your backend `.env` file** (in `/Users/weblib/Desktop/job-portal-backend/.env`)

2. **Add these two lines:**
   ```env
   GOOGLE_CLIENT_ID=1017917944371-c919rkmicfi35vs034lh5q6543ckojbl.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=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
   ```

3. **Make sure these are also in your `.env`:**
   ```env
   BACKEND_URL=http://localhost:5000
   FRONTEND_URL=http://localhost:3000
   SESSION_SECRET=your-random-secret-key-here
   ```

4. **Restart your backend server:**
   ```bash
   cd /Users/weblib/Desktop/job-portal-backend
   npm start
   ```

## ✅ Verify It's Working

1. **Start your backend server**
2. **Visit:** `http://localhost:5000/api/auth/google`
3. **You should be redirected to Google login**

## ⚠️ Important: Google Console Setup

Make sure these **Authorized redirect URIs** are added in [Google Cloud Console](https://console.cloud.google.com/):

**Development:**
```
http://localhost:5000/api/auth/google/callback
```

**Production (when you deploy):**
```
https://yourdomain.com/api/auth/google/callback
```

### How to Add Redirect URIs:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, click **ADD URI**
6. Add: `http://localhost:5000/api/auth/google/callback`
7. Click **SAVE**

## 🧪 Test OAuth Flow

1. **Start backend:**
   ```bash
   cd /Users/weblib/Desktop/job-portal-backend
   npm start
   ```

2. **Start frontend:**
   ```bash
   cd /Users/weblib/Desktop/jobportal-frontend
   npm run dev
   ```

3. **Test:**
   - Go to `http://localhost:3000/signup`
   - Click "Sign up with Google"
   - Select role (Candidate or Company)
   - Complete Google login
   - You should be redirected back and logged in

## 🔒 Security Notes

- ✅ These credentials are already configured in your code
- ✅ The passport.js file will automatically use them
- ⚠️ **Never commit `.env` file to Git** (already in `.gitignore`)
- ⚠️ Use different credentials for production

## 📋 Complete .env Example

```env
# Database
MONGODB_URI=mongodb://localhost:27017/jobportal

# JWT
JWT_SECRET=your-jwt-secret-here-minimum-32-characters
JWT_EXPIRE=30d

# URLs
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Session
SESSION_SECRET=your-session-secret-here

# Google OAuth (✅ READY)
GOOGLE_CLIENT_ID=1017917944371-c919rkmicfi35vs034lh5q6543ckojbl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Adzuna (Already configured)
ADZUNA_APP_ID=06d3c968
ADZUNA_APP_KEY=99a383380cda28c24599ebc95e220c4d
```

## ✅ Status

**Google OAuth:** ✅ Ready to use  
**Credentials:** ✅ Provided  
**Code:** ✅ Already configured  
**Next Step:** Add to `.env` and restart server

---

**Last Updated:** [Current Date]

