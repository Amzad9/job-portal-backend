import express from "express";
import {
  saveSearch,
  getSavedSearches,
  updateSavedSearch,
  deleteSavedSearch,
  getMatchingJobs,
} from "../controllers/savedSearchController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post("/", saveSearch);
router.get("/", getSavedSearches);
router.put("/:id", updateSavedSearch);
router.delete("/:id", deleteSavedSearch);
router.get("/:id/jobs", getMatchingJobs);

export default router;

