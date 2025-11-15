import nodemailer from "nodemailer";

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // Check if email credentials are configured
  if (
    !process.env.EMAIL_HOST &&
    !process.env.EMAIL_SERVICE &&
    !process.env.EMAIL_USER &&
    !process.env.EMAIL_PASSWORD
  ) {
    console.warn("⚠️  Email credentials not configured. Emails will not be sent.");
    return null;
  }

  // Use service (like Gmail) or SMTP host
  if (process.env.EMAIL_SERVICE) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE, // e.g., 'gmail', 'yahoo', 'outlook'
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  return null;
};

export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      // Fallback: log email details if not configured
      console.log("\n" + "=".repeat(60));
      console.log("📧 EMAIL (Not Sent - No Configuration)");
      console.log("=".repeat(60));
      console.log("To:", options.email);
      console.log("Subject:", options.subject);
      console.log("Message:", options.message);
      console.log("=".repeat(60) + "\n");
      return true; // Return true so the flow continues
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || options.message.replace(/\n/g, "<br>"),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    // Don't throw error - log it and return false
    // This allows the verification link to still be shown in the UI
    return false;
  }
};

// For password reset email
export const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  const resetLink = `${resetUrl}/${resetToken}`;
  
  const htmlMessage = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0074b7; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
        .button { display: inline-block; background-color: #0074b7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .link { word-break: break-all; color: #0074b7; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <p style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p class="link">${resetLink}</p>
          <div class="warning">
            <p><strong>⚠️ This link will expire in 30 minutes.</strong></p>
          </div>
          <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} WebLibron Jobs. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textMessage = `
    Password Reset Request
    
    You requested a password reset. Please click the link below to reset your password:
    
    ${resetLink}
    
    This link will expire in 30 minutes.
    
    If you didn't request this, please ignore this email. Your password will remain unchanged.
    
    © ${new Date().getFullYear()} WebLibron Jobs
  `;

  return await sendEmail({
    email,
    subject: "Password Reset Request - WebLibron Jobs",
    message: textMessage,
    html: htmlMessage,
  });
};

// For email verification
export const sendVerificationEmail = async (email, verificationToken, verificationUrl) => {
  const verificationLink = `${verificationUrl}/${verificationToken}`;
  
  const htmlMessage = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0074b7; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
        .button { display: inline-block; background-color: #0074b7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .link { word-break: break-all; color: #0074b7; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email Address</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
          <p style="text-align: center;">
            <a href="${verificationLink}" class="button">Verify Email Address</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p class="link">${verificationLink}</p>
          <p><strong>This link will expire in 24 hours.</strong></p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} WebLibron Jobs. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textMessage = `
    Verify Your Email Address
    
    Thank you for signing up! Please verify your email address by clicking the link below:
    
    ${verificationLink}
    
    This link will expire in 24 hours.
    
    If you didn't create an account, please ignore this email.
    
    © ${new Date().getFullYear()} WebLibron Jobs
  `;

  // Log the verification link for development/debugging
  console.log("\n" + "=".repeat(60));
  console.log("📧 EMAIL VERIFICATION REQUEST");
  console.log("=".repeat(60));
  console.log("To:", email);
  console.log("Subject: Verify Your Email");
  console.log("\n🔗 VERIFICATION LINK:");
  console.log(verificationLink);
  console.log("=".repeat(60) + "\n");

  return await sendEmail({
    email,
    subject: "Verify Your Email - WebLibron Jobs",
    message: textMessage,
    html: htmlMessage,
  });
};

