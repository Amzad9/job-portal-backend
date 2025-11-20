import express from "express";
import { getAdminAnalytics } from "../controllers/adminAnalyticsController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Admin only
router.get("/", protect, authorize("admin"), getAdminAnalytics);

export default router;

