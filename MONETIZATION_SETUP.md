# Monetization Features Setup Guide

This guide explains how to set up the monetization features including Stripe payments, AdSense integration, and subscription management.

## 🎯 Features Implemented

1. **Stripe Payment Integration** - Subscription management
2. **Featured Job Listings** - Premium job placement
3. **Analytics Dashboard** - Track job views and applications
4. **AdSense Integration** - Earn money from ads on job pages
5. **Subscription Tiers** - Free, Pro, Enterprise plans

---

## 📋 Required Environment Variables

Add these to your `.env` file in the **backend**:

### Stripe Configuration

```env
# Stripe API Keys (Get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_... # Your Stripe Secret Key
STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe Publishable Key (for frontend)

# Stripe Price IDs (Create products in Stripe Dashboard)
# Go to: Products > Add Product > Create recurring subscription
STRIPE_PRO_PRICE_ID=price_... # Pro plan price ID ($29/month)
STRIPE_ENTERPRISE_PRICE_ID=price_... # Enterprise plan price ID ($99/month)

# Stripe Webhook Secret (Get from Stripe Dashboard > Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook signing secret
```

### AdSense Configuration

Add to your `.env` file in the **frontend**:

```env
# Google AdSense Publisher ID (Get from https://www.google.com/adsense)
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXX
```

---

## 🔑 Step-by-Step Setup

### Step 1: Stripe Account Setup

1. **Create Stripe Account**
   - Go to https://stripe.com
   - Sign up for an account
   - Complete account verification

2. **Get API Keys**
   - Go to https://dashboard.stripe.com/apikeys
   - Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)
   - Add to backend `.env`:
     ```env
     STRIPE_SECRET_KEY=sk_test_...
     STRIPE_PUBLISHABLE_KEY=pk_test_...
     ```

3. **Create Products & Prices**
   - Go to https://dashboard.stripe.com/products
   - Click **"Add product"**
   
   **For Pro Plan ($29/month):**
   - Name: "Pro Plan"
   - Description: "Unlimited job posts, 2 featured jobs/month, analytics"
   - Pricing: $29.00 USD
   - Billing: Recurring, Monthly
   - Copy the **Price ID** (starts with `price_`)
   - Add to `.env`: `STRIPE_PRO_PRICE_ID=price_...`
   
   **For Enterprise Plan ($99/month):**
   - Name: "Enterprise Plan"
   - Description: "Everything in Pro + API access, white-label, priority support"
   - Pricing: $99.00 USD
   - Billing: Recurring, Monthly
   - Copy the **Price ID**
   - Add to `.env`: `STRIPE_ENTERPRISE_PRICE_ID=price_...`

4. **Set Up Webhook**
   - Go to https://dashboard.stripe.com/webhooks
   - Click **"Add endpoint"**
   - Endpoint URL: `https://yourdomain.com/api/subscriptions/webhook`
   - Events to send:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the **Signing secret** (starts with `whsec_`)
   - Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`

### Step 2: Google AdSense Setup

1. **Apply for AdSense**
   - Go to https://www.google.com/adsense
   - Sign in with your Google account
   - Click **"Get started"**
   - Enter your website URL
   - Complete the application process
   - Wait for approval (usually 1-2 weeks)

2. **Get Publisher ID**
   - Once approved, go to https://www.google.com/adsense
   - Click on **"Ads"** in the left menu
   - Your Publisher ID is shown at the top (format: `ca-pub-XXXXXXXXXXXXXXX`)
   - Add to frontend `.env`:
     ```env
     NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXX
     ```

3. **Create Ad Units (Optional)**
   - Go to **"Ads"** > **"By ad unit"**
   - Create ad units for different placements:
     - **Job Listing Page** (Rectangle: 300x250)
     - **Job Detail Page** (Leaderboard: 728x90)
     - **Sidebar** (Skyscraper: 160x600)
   - Copy the **Ad Slot ID** for each unit
   - Use in frontend: `<AdSense adSlot="YOUR_AD_SLOT_ID" />`

---

## 💰 Subscription Plans

### Free Plan
- **Price:** $0/month
- **Features:**
  - 3 job posts per month
  - Basic job listing
  - Standard support

### Pro Plan
- **Price:** $29/month
- **Features:**
  - Unlimited job posts
  - 2 featured jobs per month
  - Analytics dashboard
  - Email support

### Enterprise Plan
- **Price:** $99/month
- **Features:**
  - Everything in Pro
  - Unlimited featured jobs
  - API access
  - White-label option
  - Priority support

---

## 📊 API Endpoints

### Subscription Endpoints

- `GET /api/subscriptions` - Get user's subscription (Protected)
- `POST /api/subscriptions/checkout` - Create Stripe checkout session (Protected)
- `POST /api/subscriptions/cancel` - Cancel subscription (Protected)
- `GET /api/subscriptions/billing-portal` - Get billing portal URL (Protected)
- `POST /api/subscriptions/webhook` - Stripe webhook (Public, no auth)

### Analytics Endpoints

- `POST /api/analytics/job/:jobId/view` - Track job view (Public)
- `GET /api/analytics/job/:jobId` - Get job analytics (Protected)
- `GET /api/analytics/user` - Get user's all jobs analytics (Protected)

### Featured Jobs Endpoints

- `POST /api/featured/job/:jobId/feature` - Make job featured (Protected)
- `POST /api/featured/job/:jobId/unfeature` - Remove featured status (Protected)

---

## 🎨 Frontend Integration

### AdSense Component Usage

```tsx
import AdSense from "@/app/components/AdSense";

// In your job detail page
<AdSense 
  adSlot="1234567890" 
  adFormat="auto"
  className="my-8"
/>
```

### Subscription Management

Create a subscription page at `/account` or `/subscription`:

```tsx
// Example: Check subscription status
const response = await axios.get(`${API_URL}/api/subscriptions`, {
  headers: { Authorization: `Bearer ${token}` }
});

// Upgrade to Pro
const checkout = await axios.post(
  `${API_URL}/api/subscriptions/checkout`,
  { plan: "pro" },
  { headers: { Authorization: `Bearer ${token}` } }
);
window.location.href = checkout.data.url;
```

---

## 🔄 Testing

### Test Stripe Payments

1. Use Stripe test mode (keys start with `sk_test_` and `pk_test_`)
2. Use test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`
3. Test webhook locally using Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:5000/api/subscriptions/webhook
   ```

### Test AdSense

1. Use AdSense test mode during development
2. AdSense will show test ads until your site is approved
3. Once approved, real ads will appear automatically

---

## 📝 Important Notes

1. **Webhook Security**: Always verify webhook signatures in production
2. **AdSense Policy**: Follow AdSense policies (no click fraud, quality content)
3. **Subscription Limits**: Job post limits reset monthly automatically
4. **Featured Jobs**: Expire after 30 days (configurable)
5. **Analytics**: Views are tracked automatically when job pages are loaded

---

## 🚀 Production Checklist

- [ ] Switch to Stripe live keys (`sk_live_` and `pk_live_`)
- [ ] Update webhook URL to production domain
- [ ] Get AdSense approval
- [ ] Test all payment flows
- [ ] Set up email notifications for subscriptions
- [ ] Monitor webhook events in Stripe dashboard
- [ ] Set up error tracking (Sentry, etc.)

---

## 💡 Revenue Streams

1. **Subscription Revenue**: $29-99/month per user
2. **AdSense Revenue**: Based on traffic and clicks
3. **Featured Jobs**: Additional revenue (future feature)

---

## 🆘 Troubleshooting

### Stripe Issues

- **Webhook not working**: Check webhook URL and secret
- **Payment fails**: Verify card details and Stripe account status
- **Subscription not updating**: Check webhook events in Stripe dashboard

### AdSense Issues

- **Ads not showing**: Check Publisher ID and ad slot IDs
- **Low revenue**: Increase traffic, optimize ad placement
- **Policy violation**: Review AdSense policies

---

## 📞 Support

For issues or questions:
- Stripe: https://support.stripe.com
- AdSense: https://support.google.com/adsense

---

**Last Updated:** [Current Date]
**Version:** 1.0.0

