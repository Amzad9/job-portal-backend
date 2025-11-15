import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { companyName, email, password, phone, companyWebsite } = req.body;

    if (!companyName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Company name, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Create user
    const user = await User.create({
      companyName: companyName.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim(),
      companyWebsite: companyWebsite?.trim(),
    });

    // Generate verification token
    const verificationToken = user.generateVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Generate JWT token
    const token = generateToken(user._id);

    // For development: always include verification link in response
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email`;
    const verificationLink = `${verificationUrl}/${verificationToken}`;

    // Try to send verification email (may fail in development, but that's OK)
    try {
      await sendVerificationEmail(user.email, verificationToken, verificationUrl);
    } catch (emailError) {
      // Log error but don't fail the request - we'll return the link anyway
      console.error("Error sending verification email:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Account created successfully. Please check your email for verification.",
      token,
      user: {
        id: user._id,
        companyName: user.companyName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      // Always include link in response for development/testing
      verificationLink: verificationLink,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        companyName: user.companyName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user: {
        id: user._id,
        companyName: user.companyName,
        email: user.email,
        phone: user.phone,
        companyWebsite: user.companyWebsite,
        companyLogo: user.companyLogo,
        aboutCompany: user.aboutCompany,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/updateprofile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { companyName, email, phone, companyWebsite, companyLogo, aboutCompany } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
      user.email = email.toLowerCase().trim();
    }

    // Update fields
    if (companyName) user.companyName = companyName.trim();
    if (phone !== undefined) user.phone = phone?.trim() || "";
    if (companyWebsite !== undefined) user.companyWebsite = companyWebsite?.trim() || "";
    if (companyLogo !== undefined) user.companyLogo = companyLogo?.trim() || "";
    if (aboutCompany !== undefined) user.aboutCompany = aboutCompany?.trim() || "";

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        companyName: user.companyName,
        email: user.email,
        phone: user.phone,
        companyWebsite: user.companyWebsite,
        companyLogo: user.companyLogo,
        aboutCompany: user.aboutCompany,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email address",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists for security
      return res.json({
        success: true,
        message: "If that email exists, a password reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false });

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password`;
    try {
      await sendPasswordResetEmail(user.email, resetToken, resetUrl);
      res.json({
        success: true,
        message: "Password reset email sent",
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Email could not be sent",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please provide a new password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Hash token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate JWT token
    const jwtToken = generateToken(user._id);

    res.json({
      success: true,
      message: "Password reset successful",
      token: jwtToken,
      user: {
        id: user._id,
        companyName: user.companyName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Password updated successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
export const resendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new verification token
    const verificationToken = user.generateVerificationToken();
    await user.save({ validateBeforeSave: false });

    // For development: always return the verification link
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email`;
    const verificationLink = `${verificationUrl}/${verificationToken}`;

    // Try to send verification email (may fail in development, but that's OK)
    try {
      await sendVerificationEmail(user.email, verificationToken, verificationUrl);
    } catch (emailError) {
      // Log error but don't fail the request - we'll return the link anyway
      console.error("Error sending verification email:", emailError);
    }
    
    res.json({
      success: true,
      message: "Verification email sent successfully. Check your email or use the link below.",
      // Always include link in response for development/testing
      verificationLink: verificationLink,
    });
  } catch (error) {
    console.error("Error in resendVerificationEmail:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to send verification email. Please try again." 
    });
  }
};

