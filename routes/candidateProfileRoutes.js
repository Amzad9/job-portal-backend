import express from "express";
import {
  createOrUpdateProfile,
  getMyProfile,
  getPublicProfile,
  searchProfiles,
  uploadResume,
} from "../controllers/candidateProfileController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public route
router.get("/public/:slug", getPublicProfile);

// Protected routes
router.use(protect);
router.post("/", createOrUpdateProfile);
router.put("/", createOrUpdateProfile); // Same endpoint for update
router.get("/me", getMyProfile);
router.get("/search", searchProfiles);
router.post("/resume", uploadResume);

export default router;

