# OAuth Setup Guide (Google & LinkedIn)

This guide will help you set up Google and LinkedIn OAuth authentication for your job portal.

## Prerequisites

1. Node.js packages are already installed:
   - `passport`
   - `passport-google-oauth20`
   - `passport-linkedin-oauth2`
   - `express-session`

## Step 1: Google OAuth Setup

### 1.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API** (or use Google Identity Services)
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - Development: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://yourdomain.com/api/auth/google/callback`
7. Copy your **Client ID** and **Client Secret**

### 1.2 Add to Environment Variables

Add these to your `.env` file:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

## Step 2: LinkedIn OAuth Setup

### 2.1 Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click **Create app**
3. Fill in app details:
   - App name: Your Job Portal Name
   - Company: Your Company
   - Privacy policy URL: Your privacy policy URL
   - App logo: Upload a logo
4. Under **Auth** tab, add redirect URLs:
   - Development: `http://localhost:5000/api/auth/linkedin/callback`
   - Production: `https://yourdomain.com/api/auth/linkedin/callback`
5. Request access to:
   - `r_emailaddress` (Email address)
   - `r_liteprofile` (Basic profile)
6. Copy your **Client ID** and **Client Secret**

### 2.2 Add to Environment Variables

Add these to your `.env` file:

```env
LINKEDIN_CLIENT_ID=your-linkedin-client-id-here
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret-here
```

## Step 3: Additional Environment Variables

Add these to your `.env` file:

```env
# Backend URL (for OAuth callbacks)
BACKEND_URL=http://localhost:5000  # Development
# BACKEND_URL=https://yourdomain.com  # Production

# Frontend URL (for redirects after OAuth)
FRONTEND_URL=http://localhost:3000  # Development
# FRONTEND_URL=https://yourdomain.com  # Production

# Session secret (for express-session)
SESSION_SECRET=your-random-secret-key-here-minimum-32-characters
```

## Step 4: How It Works

### For Candidates:
1. User clicks "Sign up with Google" or "Sign up with LinkedIn" on signup page
2. Selects "Candidate" role
3. Redirected to OAuth provider (Google/LinkedIn)
4. After authentication, redirected back to `/oauth/callback`
5. User is automatically logged in and redirected to home page

### For Companies:
1. User clicks "Sign up with Google" or "Sign up with LinkedIn" on signup page
2. Selects "Company" role
3. Redirected to OAuth provider (Google/LinkedIn)
4. After authentication, redirected back to `/oauth/callback`
5. User is automatically logged in and redirected to home page

### For Existing Users:
- If a user already has an account with the same email, the OAuth account will be linked
- If user tries to login with password but account is OAuth-only, they'll be prompted to use OAuth

## Step 5: Testing

1. Start your backend server:
   ```bash
   npm run dev
   ```

2. Start your frontend:
   ```bash
   cd ../jobportal-frontend
   npm run dev
   ```

3. Test OAuth flow:
   - Go to `/signup` or `/login`
   - Select role (Candidate or Company)
   - Click "Sign up with Google" or "Sign up with LinkedIn"
   - Complete OAuth flow
   - You should be redirected back and logged in

## Troubleshooting

### Google OAuth Issues:
- **"redirect_uri_mismatch"**: Make sure the redirect URI in Google Console exactly matches your callback URL
- **"invalid_client"**: Check that your Client ID and Secret are correct
- **"access_denied"**: User may have denied permissions

### LinkedIn OAuth Issues:
- **"redirect_uri_mismatch"**: Make sure the redirect URI in LinkedIn app settings exactly matches your callback URL
- **"invalid_client"**: Check that your Client ID and Secret are correct
- **"insufficient_scope"**: Make sure you've requested the correct scopes (`r_emailaddress`, `r_liteprofile`)

### General Issues:
- **Session not persisting**: Check `SESSION_SECRET` is set and cookies are enabled
- **CORS errors**: Make sure `FRONTEND_URL` and `BACKEND_URL` are correctly set
- **User not created**: Check database connection and User model

## Security Notes

1. **Never commit** `.env` file to version control
2. Use strong, random `SESSION_SECRET` in production
3. Use HTTPS in production for OAuth callbacks
4. Regularly rotate OAuth credentials
5. Monitor OAuth usage for suspicious activity

## Production Checklist

- [ ] Set `BACKEND_URL` to production URL
- [ ] Set `FRONTEND_URL` to production URL
- [ ] Update OAuth redirect URIs in Google Console
- [ ] Update OAuth redirect URIs in LinkedIn app
- [ ] Set strong `SESSION_SECRET`
- [ ] Enable HTTPS
- [ ] Test OAuth flow in production
- [ ] Monitor error logs

## API Endpoints

- `GET /api/auth/google` - Initiate Google OAuth (with optional `?role=candidate` or `?role=company`)
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/linkedin` - Initiate LinkedIn OAuth (with optional `?role=candidate` or `?role=company`)
- `GET /api/auth/linkedin/callback` - LinkedIn OAuth callback

## User Model Updates

The User model now includes:
- `provider`: "local", "google", or "linkedin"
- `providerId`: OAuth provider's user ID
- `providerData`: Additional OAuth data (access tokens, profile info)
- `password`: Optional (not required for OAuth users)

