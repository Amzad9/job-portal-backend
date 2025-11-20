import Job from "../models/Job.js";
import User from "../models/User.js";
import Application from "../models/Application.js";
import Subscription from "../models/Subscription.js";
import Analytics from "../models/Analytics.js";

// Get admin dashboard analytics
export const getAdminAnalytics = async (req, res) => {
  try {
    // Only admins can access
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can access this endpoint",
      });
    }

    const { period = "30" } = req.query; // days
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total counts
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      activeJobs,
      totalCompanies,
      totalCandidates,
      totalSubscriptions,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Job.countDocuments({ createdAt: { $gte: startDate } }),
      Application.countDocuments({ createdAt: { $gte: startDate } }),
      Job.countDocuments({ status: "active" }),
      User.countDocuments({ role: "company" }),
      User.countDocuments({ role: "candidate" }),
      Subscription.countDocuments({ status: "active" }),
    ]);

    // Revenue metrics (from subscriptions)
    const activeSubscriptions = await Subscription.find({ status: "active" })
      .populate("user", "email companyName")
      .lean();

    const revenue = {
      monthly: 0,
      pro: 0,
      enterprise: 0,
    };

    activeSubscriptions.forEach((sub) => {
      if (sub.plan === "pro") {
        revenue.monthly += 29;
        revenue.pro += 1;
      } else if (sub.plan === "enterprise") {
        revenue.monthly += 99;
        revenue.enterprise += 1;
      }
    });

    // Growth trends (daily for last 30 days)
    const dailyStats = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [users, jobs, applications] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: date, $lt: nextDate } }),
        Job.countDocuments({ createdAt: { $gte: date, $lt: nextDate } }),
        Application.countDocuments({ createdAt: { $gte: date, $lt: nextDate } }),
      ]);

      dailyStats.push({
        date: date.toISOString().split("T")[0],
        users,
        jobs,
        applications,
      });
    }

    // Popular job categories
    const jobCategories = await Job.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: "$jobProfile", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Popular locations
    const popularLocations = await Job.aggregate([
      { $match: { createdAt: { $gte: startDate }, location: { $exists: true, $ne: "" } } },
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Geographic distribution
    const geographicDistribution = await Job.aggregate([
      { $match: { createdAt: { $gte: startDate }, country: { $exists: true, $ne: "" } } },
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Job status breakdown
    const jobStatusBreakdown = await Job.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Top performing jobs (by views)
    const topJobs = await Job.find({ createdAt: { $gte: startDate } })
      .sort({ views: -1 })
      .limit(10)
      .select("title companyName views applicationCount slug")
      .lean();

    // Application conversion rate
    const totalViews = await Analytics.aggregate([
      { $match: { date: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);

    const totalViewsCount = totalViews[0]?.total || 0;
    const conversionRate =
      totalViewsCount > 0 ? ((totalApplications / totalViewsCount) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      analytics: {
        overview: {
          totalUsers,
          totalJobs,
          totalApplications,
          activeJobs,
          totalCompanies,
          totalCandidates,
          totalSubscriptions,
          conversionRate: parseFloat(conversionRate),
        },
        revenue: {
          monthly: revenue.monthly,
          proSubscribers: revenue.pro,
          enterpriseSubscribers: revenue.enterprise,
          estimatedAnnual: revenue.monthly * 12,
        },
        trends: {
          daily: dailyStats,
          period: `${days} days`,
        },
        popular: {
          categories: jobCategories.map((cat) => ({
            name: cat._id || "Uncategorized",
            count: cat.count,
          })),
          locations: popularLocations.map((loc) => ({
            name: loc._id,
            count: loc.count,
          })),
        },
        geographic: geographicDistribution.map((geo) => ({
          country: geo._id,
          count: geo.count,
        })),
        jobStatus: jobStatusBreakdown.map((status) => ({
          status: status._id,
          count: status.count,
        })),
        topJobs: topJobs.map((job) => ({
          title: job.title,
          company: job.companyName,
          views: job.views || 0,
          applications: job.applicationCount || 0,
          slug: job.slug,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching admin analytics",
    });
  }
};

