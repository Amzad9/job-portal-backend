import express from "express";
import {
  trackJobView,
  getJobAnalytics,
  getUserAnalytics,
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public route for tracking views
router.post("/job/:jobId/view", trackJobView);

// Protected routes
router.get("/job/:jobId", protect, getJobAnalytics);
router.get("/user", protect, getUserAnalytics);

export default router;

