import dotenv from "dotenv";
// Load environment variables FIRST
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy (only if credentials are configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log("✅ Registering Google OAuth strategy...");
  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`}/api/auth/google/callback`,
        passReqToCallback: true, // Pass request to callback to access state
      },
      async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ providerId: profile.id, provider: "google" });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with this email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link OAuth account to existing user
          user.provider = "google";
          user.providerId = profile.id;
          user.providerData = {
            accessToken,
            refreshToken,
            profile: profile._json,
          };
          // Auto-verify email for OAuth users
          user.isVerified = true;
          await user.save();
          return done(null, user);
        }

        // Create new user from Google profile
        // Extract name from profile
        const name = profile.displayName || profile.name?.givenName || "";
        const email = profile.emails[0].value;

        // Determine role from state (passed via query params in req)
        let role = "candidate";
        if (req && req.query && req.query.state) {
          try {
            const stateData = JSON.parse(Buffer.from(req.query.state, "base64").toString());
            role = stateData.role || "candidate";
          } catch (e) {
            // Use default
          }
        }

        const newUser = await User.create({
          email: email.toLowerCase(),
          name: name,
          provider: "google",
          providerId: profile.id,
          providerData: {
            accessToken,
            refreshToken,
            profile: profile._json,
          },
          isVerified: true, // OAuth emails are pre-verified
          role: role,
          password: undefined, // No password for OAuth users
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
    )
  );
} else {
  console.warn("Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable.");
}


export default passport;

