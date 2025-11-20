import Job from "../models/Job.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import { PLANS } from "./subscriptionController.js";

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

// Check subscription limits
const checkJobPostLimit = async (userId) => {
  // Admins have unlimited posts
  const user = await User.findById(userId);
  if (user.role === "admin") {
    return { allowed: true, remaining: -1 };
  }

  const subscription = await Subscription.findOne({ user: userId });
  const plan = subscription?.plan || "free";
  const planDetails = PLANS[plan] || PLANS.free;

  // Unlimited posts
  if (planDetails.jobPostsLimit === -1) {
    return { allowed: true, remaining: -1 };
  }

  // Check monthly limit
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Reset count if new month
  if (!user.lastJobPostReset || user.lastJobPostReset < startOfMonth) {
    user.jobPostsCount = 0;
    user.lastJobPostReset = now;
    await user.save();
  }

  const remaining = planDetails.jobPostsLimit - user.jobPostsCount;
  
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    limit: planDetails.jobPostsLimit,
  };
};

export const createJob = async (req, res) => {
  try {
    const { title, companyName, location, slug } = req.body;

    // Check if user is authenticated (should be, due to protect middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to create jobs",
      });
    }

    // Check subscription limits (skip for admin)
    if (req.user.role !== "admin") {
      const limitCheck = await checkJobPostLimit(req.user._id);
      if (!limitCheck.allowed) {
        return res.status(403).json({
          success: false,
          message: `You've reached your monthly job posting limit (${limitCheck.limit}). Upgrade to Pro for unlimited posts.`,
          limit: limitCheck.limit,
          remaining: limitCheck.remaining,
        });
      }
    }

    // Validate required fields
    // For admins, companyName is required. For companies, it will be taken from their account.
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (req.user.role === "admin" && !companyName) {
      return res.status(400).json({
        success: false,
        message: "Company name is required for admin users",
      });
    }

    // Allow both admin and regular users to create jobs
    // Admins can post jobs for any company, regular users post for their own company
    const jobData = {
      ...req.body,
      createdBy: req.user._id,
    };

    // If user is not admin, use their company name from their account
    if (req.user.role !== "admin") {
      if (!req.user.companyName) {
        return res.status(400).json({
          success: false,
          message: "Company name not found in your account. Please update your profile.",
        });
      }
      jobData.companyName = req.user.companyName;
      if (req.user.companyLogo) {
        jobData.companyLogo = req.user.companyLogo;
      }
      if (req.user.companyWebsite) {
        jobData.companyWebsite = req.user.companyWebsite;
      }
      if (req.user.aboutCompany) {
        jobData.aboutCompany = req.user.aboutCompany;
      }
    }

    // Generate or validate slug
    let finalSlug = slug || generateSlug(title);
    
    // Ensure slug is unique
    let existingJob = await Job.findOne({ slug: finalSlug });
    let counter = 1;
    while (existingJob) {
      finalSlug = `${generateSlug(title)}-${counter}`;
      existingJob = await Job.findOne({ slug: finalSlug });
      counter++;
    }
    
    jobData.slug = finalSlug;
    
    // Ensure status is set to "active" for new jobs
    if (!jobData.status) {
      jobData.status = "active";
    }

    // Check for duplicate job by title (use the final company name that will be saved)
    const finalCompanyName = jobData.companyName || companyName;
    const duplicateJob = await Job.findOne({
      title: new RegExp(`^${title}$`, "i"),
      companyName: new RegExp(`^${finalCompanyName}$`, "i"),
    });

    if (duplicateJob) {
      return res.status(400).json({
        success: false,
        message: "A job with this title and company already exists.",
      });
    }

    const job = await Job.create(jobData);
    
    // Update user's job post count (skip for admin)
    if (req.user.role !== "admin") {
      const user = await User.findById(req.user._id);
      user.jobPostsCount = (user.jobPostsCount || 0) + 1;
      await user.save();
    }
    
    res.status(201).json({ success: true, job });
  } catch (error) {
    // Handle MongoDB duplicate key error for slug
    if (error.code === 11000 && error.keyPattern?.slug) {
      return res.status(400).json({
        success: false,
        message: "A job with this slug already exists. Please try a different title.",
      });
    }
    
    console.error("Error creating job:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Error creating job post" 
    });
  }
};


export const getJobs = async (req, res) => {
  try {
    const {
      title,
      location,
      country,
      workType,
      jobType,
      jobProfile,
      skills,
      keyword,
      status,
      page = 1,
      limit = 20,
      sort = "newest",
      all = false, // For admin: fetch all jobs regardless of status
      // Advanced filters
      salaryMin,
      salaryMax,
      experienceLevel,
      remote,
      datePosted, // "today", "week", "month", "all"
    } = req.query;

    // Default query: only show active jobs (unless 'all' is requested)
    // Also include jobs without status field for backward compatibility
    const query = all ? {} : { 
      $or: [
        { status: "active" },
        { status: { $exists: false } } // Include jobs without status field
      ]
    };

    // If status is specified, use it (for admin filtering)
    if (status && all) {
      query.status = status;
      delete query.$or; // Remove $or when status is explicitly set
    }

    // Helper function to escape special regex characters for safe regex matching
    const escapeRegex = (str) => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    if (location) query.location = new RegExp(escapeRegex(location), "i");
    // For title, allow partial matching (title contains the search term)
    if (title) {
      const escapedTitle = escapeRegex(title);
      query.title = new RegExp(escapedTitle, "i");
    }
    if (country) query.country = new RegExp(escapeRegex(country), "i");
    if (workType) query.workType = new RegExp(workType, "i");
    if (jobType) query.jobType = new RegExp(jobType, "i");
    if (jobProfile) query.jobProfile = new RegExp(jobProfile, "i");
    if (skills) query.skills = { $in: skills.split(",").map((s) => s.trim()) };
    if (keyword) {
      query.$or = [
        { skills: { $regex: keyword, $options: "i" } },
        { companyName: { $regex: keyword, $options: "i" } },
        { aboutRole: { $regex: keyword, $options: "i" } },
      ];
    }

    // Advanced filters
    if (experienceLevel) {
      query.experienceLevel = new RegExp(escapeRegex(experienceLevel), "i");
    }
    if (remote === "true" || remote === true) {
      query.workType = "Remote";
    }
    if (salaryMin || salaryMax) {
      // Note: This is a simplified salary filter
      // You may need to enhance based on your salary format (e.g., "50k-100k", "$50,000", etc.)
      query.salary = { $exists: true, $ne: "" };
      // For more advanced salary filtering, you'd need to parse and store salary as numbers
    }
    if (datePosted) {
      const now = new Date();
      let dateFilter;
      switch (datePosted) {
        case "today":
          dateFilter = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "week":
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = null;
      }
      if (dateFilter) {
        query.createdAt = { $gte: dateFilter };
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      salary: { salary: -1 },
      featured: { isFeatured: -1, createdAt: -1 }, // Featured jobs first
    };
    
    // Default sort: featured first, then newest
    const sortBy = sortOptions[sort] || sortOptions.featured;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate("createdBy", "role companyName name")
        .sort(sortOptions[sort] || sortOptions.newest)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Job.countDocuments(query),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJobBySlug = async (req, res) => {
  try {
    const job = await Job.findOne({ slug: req.params.slug })
      .populate("createdBy", "role companyName name")
      .lean();
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    // Check if user is authenticated (should be, due to protect middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update jobs",
      });
    }

    // Find the job first to check ownership
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Authorization check: Companies can only update their own jobs, admins can update any job
    if (req.user.role !== "admin") {
      // Check if the job was created by this user
      if (job.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this job. You can only update jobs you created.",
        });
      }

      // For company users, prevent changing company name and use their company info
      const updateData = { ...req.body };
      if (req.user.companyName) {
        updateData.companyName = req.user.companyName;
      }
      if (req.user.companyLogo) {
        updateData.companyLogo = req.user.companyLogo;
      }
      if (req.user.companyWebsite) {
        updateData.companyWebsite = req.user.companyWebsite;
      }
      if (req.user.aboutCompany) {
        updateData.aboutCompany = req.user.aboutCompany;
      }

      // If title is being updated, regenerate slug
      if (updateData.title && updateData.title !== job.title) {
        let finalSlug = generateSlug(updateData.title);
        let existingJob = await Job.findOne({ slug: finalSlug, _id: { $ne: req.params.id } });
        let counter = 1;
        while (existingJob) {
          finalSlug = `${generateSlug(updateData.title)}-${counter}`;
          existingJob = await Job.findOne({ slug: finalSlug, _id: { $ne: req.params.id } });
          counter++;
        }
        updateData.slug = finalSlug;
      }

      const updatedJob = await Job.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
      return res.json({ success: true, job: updatedJob });
    } else {
      // Admin can update any job, including company name
      // If title is being updated, regenerate slug
      if (req.body.title && req.body.title !== job.title) {
        let finalSlug = generateSlug(req.body.title);
        let existingJob = await Job.findOne({ slug: finalSlug, _id: { $ne: req.params.id } });
        let counter = 1;
        while (existingJob) {
          finalSlug = `${generateSlug(req.body.title)}-${counter}`;
          existingJob = await Job.findOne({ slug: finalSlug, _id: { $ne: req.params.id } });
          counter++;
        }
        req.body.slug = finalSlug;
      }

      const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      return res.json({ success: true, job: updatedJob });
    }
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating job",
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    // Check if user is authenticated (should be, due to protect middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete jobs",
      });
    }

    // Find the job first to check ownership
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Authorization check: Companies can only delete their own jobs, admins can delete any job
    if (req.user.role !== "admin") {
      // Check if the job was created by this user
      if (job.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this job. You can only delete jobs you created.",
        });
      }
    }

    // Delete the job
    await Job.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting job",
    });
  }
};

export const getJobTitles = async (req, res) => {
  try {
    const titles = await Job.distinct("title", { status: "active" });
    // Sort titles alphabetically
    const sortedTitles = titles.sort((a, b) => a.localeCompare(b));
    res.json({ success: true, titles: sortedTitles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJobLocations = async (req, res) => {
  try {
    const { all = false } = req.query;
    const query = all ? { location: { $ne: null, $ne: "" } } : { status: "active", location: { $ne: null, $ne: "" } };
    const locations = await Job.distinct("location", query);
    // Sort locations alphabetically and filter out null/empty
    const sortedLocations = locations
      .filter((loc) => loc && loc.trim() !== "")
      .sort((a, b) => a.localeCompare(b));
    res.json({ success: true, locations: sortedLocations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
