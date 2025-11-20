import express from "express";
import {
  createApplication,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus,
  checkApplication,
} from "../controllers/applicationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public route - check if user has applied (works for both authenticated and unauthenticated)
router.route("/check/:jobId").get(checkApplication);

// Protected routes
router.route("/").post(protect, createApplication);
router.route("/my-applications").get(protect, getMyApplications);
router.route("/job/:jobId").get(protect, getJobApplications);
router.route("/:id/status").put(protect, updateApplicationStatus);

export default router;

