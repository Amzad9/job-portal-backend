import passport from "../config/passport.js";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

// Google OAuth - Initiate
export const googleAuth = (req, res, next) => {
  // Get role from query params (candidate or company)
  const role = req.query.role || "candidate";
  const state = Buffer.from(JSON.stringify({ role })).toString("base64");
  
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: state,
  })(req, res, next);
};

// Google OAuth - Callback
export const googleCallback = async (req, res, next) => {
  passport.authenticate("google", { session: false }, async (err, user, info) => {
    try {
      if (err) {
        return res.redirect(
          `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=${encodeURIComponent(err.message)}`
        );
      }

      if (!user) {
        return res.redirect(
          `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=${encodeURIComponent("Authentication failed")}`
        );
      }

      // Get role from state if available
      let role = "candidate";
      if (req.query.state) {
        try {
          const stateData = JSON.parse(Buffer.from(req.query.state, "base64").toString());
          role = stateData.role || "candidate";
        } catch (e) {
          // Use default role
        }
      }

      // Update user role if needed (only if user is new or role is candidate)
      if (user.role === "candidate" && role === "company") {
        user.role = "company";
        // For company, we might need to extract company name from profile
        if (user.providerData?.profile) {
          // Try to extract company name from Google profile if available
          // This is optional - user can update it later
        }
        await user.save();
      }

      // Generate JWT token
      const token = generateToken(user._id);

      // Redirect to frontend with token
      const redirectUrl = new URL(`${process.env.FRONTEND_URL || "http://localhost:3000"}/oauth/callback`);
      redirectUrl.searchParams.set("token", token);
      redirectUrl.searchParams.set("role", user.role);
      redirectUrl.searchParams.set("provider", "google");

      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=${encodeURIComponent(error.message)}`
      );
    }
  })(req, res, next);
};

