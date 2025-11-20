# 🔑 Complete Environment Variables Setup

## ✅ **Google OAuth Credentials** (Provided)

Add these to your backend `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=1017917944371-c919rkmicfi35vs034lh5q6543ckojbl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

## 📋 **Complete Backend .env File**

Here's your complete `.env` file with all required variables:

```env
# Database
MONGODB_URI=your-mongodb-connection-string

# JWT Authentication
JWT_SECRET=your-secret-key-here-minimum-32-characters
JWT_EXPIRE=30d

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server
PORT=5000
NODE_ENV=development

# Session Secret (for OAuth)
SESSION_SECRET=your-session-secret-key-change-in-production

# Google OAuth (✅ PROVIDED)
GOOGLE_CLIENT_ID=1017917944371-c919rkmicfi35vs034lh5q6543ckojbl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# LinkedIn OAuth (Optional - if you want to add later)
# LINKEDIN_CLIENT_ID=your-linkedin-client-id
# LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Email Configuration (Optional - for email notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Adzuna API (✅ Already Configured - Don't Touch)
ADZUNA_APP_ID=06d3c968
ADZUNA_APP_KEY=99a383380cda28c24599ebc95e220c4d
ADZUNA_IMPORT_SCHEDULE=0 */3 * * *
ADZUNA_IMPORT_COUNTRIES=us
ENABLE_ADZUNA_IMPORT=true

# Stripe Payment (Required for subscriptions - Get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AdSense (Required for ad revenue - Get from Google AdSense)
# Add to FRONTEND .env file:
# NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-...
```

## ✅ **What's Already Configured**

1. ✅ **Google OAuth** - Credentials provided above
2. ✅ **Adzuna API** - Already working
3. ✅ **Database** - MongoDB (you need to add connection string)
4. ✅ **JWT** - You need to add secret key

## ⚠️ **What You Still Need**

### Required:
1. **MongoDB Connection String**
   - Get from MongoDB Atlas or your MongoDB instance
   - Format: `mongodb://localhost:27017/jobportal` or `mongodb+srv://user:pass@cluster.mongodb.net/jobportal`

2. **JWT Secret**
   - Generate a random string (minimum 32 characters)
   - Example: `openssl rand -base64 32`

3. **Stripe Keys** (For subscriptions)
   - Get from https://dashboard.stripe.com/apikeys
   - See `MONETIZATION_SETUP.md` for details

4. **AdSense Publisher ID** (For ad revenue)
   - Get from https://www.google.com/adsense
   - Add to frontend `.env` file

### Optional (But Recommended):
5. **Email Configuration** (For notifications)
   - Gmail app password or SMTP credentials
   - See `EMAIL_SETUP.md` for details

6. **LinkedIn OAuth** (If you want LinkedIn login)
   - Get from https://www.linkedin.com/developers/

## 🚀 **Quick Setup Steps**

1. **Copy the Google OAuth credentials above to your `.env` file**

2. **Add MongoDB connection:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/jobportal
   ```
   Or for MongoDB Atlas:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobportal
   ```

3. **Generate JWT secret:**
   ```bash
   openssl rand -base64 32
   ```
   Add to `.env`:
   ```env
   JWT_SECRET=your-generated-secret-here
   ```

4. **Set up Stripe** (See `MONETIZATION_SETUP.md`)

5. **Set up AdSense** (See `MONETIZATION_SETUP.md`)

## ✅ **Verification**

After adding credentials, test:

1. **Google OAuth:**
   - Visit: `http://localhost:5000/api/auth/google`
   - Should redirect to Google login

2. **Server:**
   - Start server: `npm start`
   - Should connect to database without errors

3. **OAuth Callback:**
   - Make sure callback URL is set in Google Console:
   - `http://localhost:5000/api/auth/google/callback`

## 📝 **Google OAuth Callback URLs**

Make sure these are added in [Google Cloud Console](https://console.cloud.google.com/):

**Authorized redirect URIs:**
- Development: `http://localhost:5000/api/auth/google/callback`
- Production: `https://yourdomain.com/api/auth/google/callback`

## 🔒 **Security Notes**

1. **Never commit `.env` file to Git** (already in `.gitignore`)
2. **Use different keys for development and production**
3. **Rotate secrets if compromised**
4. **Keep OAuth secrets secure**

---

**Last Updated:** [Current Date]
**Status:** ✅ Google OAuth credentials ready to use

