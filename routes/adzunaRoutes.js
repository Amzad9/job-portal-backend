import express from "express";
import { manualImport, getImportStats, fetchAdzunaJobs } from "../controllers/adzunaController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public route - fetch Adzuna jobs for frontend
router.get("/jobs", fetchAdzunaJobs);

// Test endpoint to check if Adzuna API is configured
router.get("/test", async (req, res) => {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  
  res.json({
    success: true,
    configured: !!(appId && appKey),
    hasAppId: !!appId,
    hasAppKey: !!appKey,
    appIdPrefix: appId ? appId.substring(0, 4) + "..." : "not set",
  });
});

// Admin routes - require authentication and admin role
router.post("/import", protect, authorize("admin"), manualImport);
router.get("/stats", protect, authorize("admin"), getImportStats);

export default router;

