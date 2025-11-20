import express from "express";
import {
  signup,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateProfile,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/authController.js";
import {
  googleAuth,
  googleCallback,
} from "../controllers/oauthController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Regular auth routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/updateprofile", protect, updateProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.put("/update-password", protect, updatePassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", protect, resendVerificationEmail);

// OAuth routes
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

export default router;

