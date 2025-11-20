import express from "express";
import {
  makeJobFeatured,
  removeFeatured,
} from "../controllers/featuredController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/job/:jobId/feature", protect, makeJobFeatured);
router.post("/job/:jobId/unfeature", protect, removeFeatured);

export default router;

