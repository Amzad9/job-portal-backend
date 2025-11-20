# 🔑 Required API Keys & Credentials

This document lists all the API keys and credentials you need to provide for the monetization features to work.

---

## ✅ **STRIPE PAYMENT INTEGRATION** (Required for Subscriptions)

### 1. Stripe Account
- **Where to get:** https://stripe.com
- **Cost:** Free to sign up, 2.9% + $0.30 per transaction
- **Required Keys:**

```env
# Backend .env file
STRIPE_SECRET_KEY=sk_test_... # or sk_live_ for production
STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_ for production
STRIPE_PRO_PRICE_ID=price_... # Create in Stripe Dashboard
STRIPE_ENTERPRISE_PRICE_ID=price_... # Create in Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_... # Get from Stripe Webhooks
```

**Steps:**
1. Sign up at https://stripe.com
2. Go to https://dashboard.stripe.com/apikeys
3. Copy **Publishable key** and **Secret key**
4. Create products in Stripe Dashboard:
   - Pro Plan: $29/month recurring
   - Enterprise Plan: $99/month recurring
5. Copy the **Price ID** for each product
6. Set up webhook at https://dashboard.stripe.com/webhooks
7. Copy the **Webhook signing secret**

---

## ✅ **GOOGLE ADSENSE** (Required for Ad Revenue)

### 2. Google AdSense Account
- **Where to get:** https://www.google.com/adsense
- **Cost:** Free
- **Required Key:**

```env
# Frontend .env file
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXX
```

**Steps:**
1. Go to https://www.google.com/adsense
2. Sign in with Google account
3. Click "Get started"
4. Enter your website URL
5. Complete application
6. Wait for approval (1-2 weeks typically)
7. Once approved, get your **Publisher ID** (format: `ca-pub-XXXXXXXXXXXXXXX`)

**Note:** AdSense will show test ads until your site is approved.

---

## 📋 **EXISTING KEYS** (You Already Have These)

These are already configured in your system:

### 3. Database (MongoDB)
- **MongoDB Connection String** - Already configured
- **Location:** `config/db.js`

### 4. JWT Authentication
- **JWT_SECRET** - Already configured
- **Location:** Backend `.env`

### 5. Email Service
- **EMAIL_USER, EMAIL_PASSWORD** - Already configured (optional)
- **Location:** Backend `.env`

### 6. OAuth (Optional)
- **GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET** - Already configured (optional)
- **LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET** - Already configured (optional)
- **Location:** Backend `.env`

### 7. Adzuna API (Already Working - Don't Touch)
- **ADZUNA_APP_ID** - Already configured ✅
- **ADZUNA_APP_KEY** - Already configured ✅
- **Location:** Backend `.env`
- **Note:** Do not modify Adzuna integration

---

## 🚀 **QUICK SETUP CHECKLIST**

### Backend `.env` File:
```env
# Stripe (NEW - Required)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Existing (Keep these)
JWT_SECRET=...
MONGODB_URI=...
FRONTEND_URL=...
ADZUNA_APP_ID=... # Don't touch
ADZUNA_APP_KEY=... # Don't touch
```

### Frontend `.env` File:
```env
# AdSense (NEW - Required)
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-...

# Existing (Keep these)
NEXT_PUBLIC_API_URL=...
```

---

## 💰 **REVENUE STREAMS**

1. **Stripe Subscriptions:**
   - Pro Plan: $29/month per user
   - Enterprise Plan: $99/month per user
   - You keep: ~97% (Stripe takes 2.9% + $0.30)

2. **AdSense Revenue:**
   - Based on traffic and ad clicks
   - Typically $1-5 per 1000 page views
   - Paid monthly by Google

---

## ⚠️ **IMPORTANT NOTES**

1. **Stripe Test Mode:**
   - Use `sk_test_` and `pk_test_` for development
   - Switch to `sk_live_` and `pk_live_` for production
   - Test cards: `4242 4242 4242 4242` (success)

2. **AdSense Approval:**
   - Can take 1-2 weeks
   - Need quality content and traffic
   - Follow AdSense policies strictly

3. **Webhook URL:**
   - Development: `http://localhost:5000/api/subscriptions/webhook`
   - Production: `https://yourdomain.com/api/subscriptions/webhook`
   - Must be HTTPS in production

4. **Security:**
   - Never commit `.env` files to Git
   - Use different keys for development and production
   - Rotate keys if compromised

---

## 📞 **SUPPORT**

- **Stripe Support:** https://support.stripe.com
- **AdSense Support:** https://support.google.com/adsense
- **Documentation:** See `MONETIZATION_SETUP.md` for detailed setup

---

## ✅ **VERIFICATION**

After adding keys, verify:

1. **Stripe:**
   ```bash
   # Test checkout session creation
   curl -X POST http://localhost:5000/api/subscriptions/checkout \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"plan": "pro"}'
   ```

2. **AdSense:**
   - Check browser console for AdSense script loading
   - Verify Publisher ID in network requests
   - Test ads should appear (if not approved yet)

---

**Last Updated:** [Current Date]

