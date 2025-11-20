# Authentication Setup

## Required Dependencies

Install the following packages in the backend:

```bash
npm install bcryptjs jsonwebtoken
```

## Environment Variables

Add these to your `.env` file:

```
JWT_SECRET=your-secret-key-here-minimum-32-characters
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
```

## Email Configuration

The email sending functionality is currently a placeholder. To enable actual email sending:

1. Install nodemailer: `npm install nodemailer`
2. Update `utils/sendEmail.js` with your email service configuration (SendGrid, AWS SES, or SMTP)

## API Endpoints

- POST `/api/auth/signup` - Register new company
- POST `/api/auth/login` - Login company
- GET `/api/auth/me` - Get current user (protected)
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-password/:token` - Reset password with token
- PUT `/api/auth/update-password` - Update password (protected)
- GET `/api/auth/verify-email/:token` - Verify email address

## Frontend Pages

- `/login` - Login page
- `/signup` - Signup page
- `/forgot-password` - Forgot password page
- `/reset-password/[token]` - Reset password page

## Features

- Company registration with email verification
- Secure password hashing with bcrypt
- JWT token-based authentication
- Password reset functionality
- Protected routes with middleware
- Auto-fill company info when logged in

