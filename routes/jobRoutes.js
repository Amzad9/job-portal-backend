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

const router = express.Router();

router.route("/").get(getJobs).post(createJob);
router.route("/titles").get(getJobTitles);
router.route("/locations").get(getJobLocations);
router.route("/slug/:slug").get(getJobBySlug);
router.route("/:id").put(updateJob).delete(deleteJob);

export default router;
