import Analytics from "../models/Analytics.js";
import Job from "../models/Job.js";

// Track job view
export const trackJobView = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Update job views count
    await Job.findByIdAndUpdate(jobId, { $inc: { views: 1 } });

    // Track in analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let analytics = await Analytics.findOne({
      job: jobId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });

    if (analytics) {
      analytics.views += 1;
      await analytics.save();
    } else {
      analytics = await Analytics.create({
        job: jobId,
        views: 1,
        date: today,
      });
    }

    res.status(200).json({
      success: true,
      views: analytics.views,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error tracking view",
    });
  }
};

// Get job analytics
export const getJobAnalytics = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { days = 30 } = req.query;

    const job = await Job.findById(jobId).populate("createdBy");

    // Check if user owns the job or is admin
    if (
      job.createdBy._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this analytics",
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const analytics = await Analytics.find({
      job: jobId,
      date: { $gte: startDate },
    }).sort({ date: -1 });

    const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
    const totalApplications = job.applicationCount || 0;
    const totalClicks = analytics.reduce((sum, a) => sum + (a.clicks || 0), 0);

    // Calculate conversion rate
    const conversionRate =
      totalViews > 0 ? ((totalApplications / totalViews) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      analytics: {
        totalViews,
        totalApplications,
        totalClicks,
        conversionRate: parseFloat(conversionRate),
        dailyData: analytics.map((a) => ({
          date: a.date,
          views: a.views,
          applications: a.applications || 0,
          clicks: a.clicks || 0,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching analytics",
    });
  }
};

// Get user's all jobs analytics summary
export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all jobs by user
    const jobs = await Job.find({ createdBy: userId });

    const jobIds = jobs.map((job) => job._id);

    const analytics = await Analytics.find({ job: { $in: jobIds } });

    const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
    const totalApplications = jobs.reduce((sum, job) => sum + (job.applicationCount || 0), 0);
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((job) => job.status === "active").length;

    res.status(200).json({
      success: true,
      analytics: {
        totalViews,
        totalApplications,
        totalJobs,
        activeJobs,
        conversionRate:
          totalViews > 0 ? ((totalApplications / totalViews) * 100).toFixed(2) : 0,
        jobs: jobs.map((job) => ({
          id: job._id,
          title: job.title,
          views: job.views || 0,
          applications: job.applicationCount || 0,
          status: job.status,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching analytics",
    });
  }
};

