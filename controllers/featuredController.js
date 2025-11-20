import Job from "../models/Job.js";
import Subscription from "../models/Subscription.js";
import { PLANS } from "./subscriptionController.js";

// Make job featured
export const makeJobFeatured = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { duration = 30 } = req.body; // Duration in days

    const job = await Job.findById(jobId).populate("createdBy");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user owns the job or is admin
    if (
      job.createdBy._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to feature this job",
      });
    }

    // Check subscription limits
    if (req.user.role !== "admin") {
      const subscription = await Subscription.findOne({ user: req.user._id });

      if (!subscription || subscription.plan === "free") {
        return res.status(403).json({
          success: false,
          message: "Featured jobs are only available for Pro and Enterprise plans",
        });
      }

      // Check featured jobs limit for current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const featuredJobsThisMonth = await Job.countDocuments({
        createdBy: req.user._id,
        isFeatured: true,
        featuredUntil: { $gte: startOfMonth },
      });

      const planDetails = PLANS[subscription.plan];
      if (
        planDetails.featuredJobsPerMonth !== -1 &&
        featuredJobsThisMonth >= planDetails.featuredJobsPerMonth
      ) {
        return res.status(403).json({
          success: false,
          message: `You've reached your monthly limit of ${planDetails.featuredJobsPerMonth} featured jobs`,
        });
      }
    }

    // Set featured status
    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + parseInt(duration));

    job.isFeatured = true;
    job.featuredUntil = featuredUntil;
    await job.save();

    res.status(200).json({
      success: true,
      message: "Job featured successfully",
      job: {
        _id: job._id,
        title: job.title,
        isFeatured: job.isFeatured,
        featuredUntil: job.featuredUntil,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error featuring job",
    });
  }
};

// Remove featured status
export const removeFeatured = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user owns the job or is admin
    if (
      job.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to remove featured status",
      });
    }

    job.isFeatured = false;
    job.featuredUntil = null;
    await job.save();

    res.status(200).json({
      success: true,
      message: "Featured status removed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error removing featured status",
    });
  }
};

// Check and update expired featured jobs (cron job)
export const updateExpiredFeaturedJobs = async () => {
  try {
    const now = new Date();
    const result = await Job.updateMany(
      {
        isFeatured: true,
        featuredUntil: { $lt: now },
      },
      {
        $set: {
          isFeatured: false,
          featuredUntil: null,
        },
      }
    );

    console.log(`Updated ${result.modifiedCount} expired featured jobs`);
    return result;
  } catch (error) {
    console.error("Error updating expired featured jobs:", error);
    throw error;
  }
};

