# ✅ Google OAuth Fix - "Unknown authentication strategy 'google'"

## 🔧 **Problem Fixed**

The error "Unknown authentication strategy 'google'" occurred because:
- `passport.js` was imported **before** `dotenv.config()` was called
- Environment variables weren't loaded when the Google strategy tried to register
- The strategy registration was skipped

## ✅ **Solution Applied**

1. **Moved `dotenv.config()` to the top of `server.js`** - Before any imports that use environment variables
2. **Updated callback URL** - Now uses `BACKEND_URL` from `.env` or defaults to `http://localhost:5001`

## 🚀 **Action Required: Restart Server**

**You MUST restart your backend server** for the changes to take effect:

```bash
# Stop the current server (Ctrl+C in the terminal where it's running)
# Then restart:
cd /Users/weblib/Desktop/job-portal-backend
npm start
```

## ✅ **Verification**

After restarting, you should see:
- ✅ No "Google OAuth not configured" warning
- ✅ Google strategy registered successfully
- ✅ Google login should work

## 🧪 **Test Google OAuth**

1. **Restart backend server**
2. **Visit:** `http://localhost:5001/api/auth/google`
3. **You should be redirected to Google login**

## ⚠️ **Important: Google Console Setup**

Make sure this **Authorized redirect URI** is added in [Google Cloud Console](https://console.cloud.google.com/):

```
http://localhost:5001/api/auth/google/callback
```

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add:
   - `http://localhost:5001/api/auth/google/callback`
6. Click **SAVE**

## 📝 **Current Configuration**

Your `.env` file has:
```env
GOOGLE_CLIENT_ID=1017917944371-c919rkmicfi35vs034lh5q6543ckojbl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
BACKEND_URL=http://localhost:5001
```

## ✅ **Status**

- ✅ Code fixed
- ✅ Environment variables loaded correctly
- ⚠️ **Server restart required**

---

**Next Step:** Restart your backend server and test Google login!

