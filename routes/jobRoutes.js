import express from "express";
import {
  createJob,
  getJobs,
  getJobBySlug,
  updateJob,
  deleteJob,
  getJobTitles,
  getJobLocations,
} from "../controllers/jobController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.route("/").get(getJobs);
router.route("/titles").get(getJobTitles);
router.route("/locations").get(getJobLocations);
router.route("/slug/:slug").get(getJobBySlug);

// Protected routes - require authentication
router.route("/").post(protect, createJob);
router.route("/:id").put(protect, updateJob).delete(protect, deleteJob);

export default router;
