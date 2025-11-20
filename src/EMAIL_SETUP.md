# Email Setup Guide

This guide will help you configure email sending for verification and password reset emails.

## Option 1: Gmail (Recommended for Development/Testing)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter "WebLibron Jobs" as the name
4. Click "Generate"
5. Copy the 16-character password (no spaces)

### Step 3: Add to .env file
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
EMAIL_FROM=your-email@gmail.com
FRONTEND_URL=http://localhost:3000
```

## Option 2: Custom SMTP Server

For other email providers (Outlook, Yahoo, custom SMTP):

```env
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=your-email@example.com
FRONTEND_URL=http://localhost:3000
```

### Common SMTP Settings:

**Gmail:**
- Host: smtp.gmail.com
- Port: 587
- Secure: false

**Outlook/Hotmail:**
- Host: smtp-mail.outlook.com
- Port: 587
- Secure: false

**Yahoo:**
- Host: smtp.mail.yahoo.com
- Port: 587
- Secure: false

## Option 3: Email Service Providers (Production)

For production, consider using:
- **SendGrid** (Free tier: 100 emails/day)
- **AWS SES** (Very affordable)
- **Mailgun** (Free tier: 5,000 emails/month)
- **Resend** (Modern, developer-friendly)

### Example with SendGrid:
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
```

## Testing

After configuring, restart your backend server and try:
1. Sign up a new account
2. Check your email inbox
3. Click the verification link

## Troubleshooting

- **"Invalid login"**: Check your email and password
- **"Connection timeout"**: Check firewall/network settings
- **Gmail "Less secure app"**: Use App Password instead (recommended)
- **Emails going to spam**: Add SPF/DKIM records for your domain (production)

## Notes

- For Gmail, you MUST use an App Password, not your regular password
- The verification link will also appear in the account page UI as a fallback
- Check server console logs for email sending status

