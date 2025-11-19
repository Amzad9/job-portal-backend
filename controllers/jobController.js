import Job from "../models/Job.js";

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
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

    // Validate required fields
    if (!title || !companyName) {
      return res.status(400).json({
        success: false,
        message: "Title and company name are required",
      });
    }

    // Allow both admin and regular users to create jobs
    // Admins can post jobs for any company, regular users post for their own company
    const jobData = {
      ...req.body,
      createdBy: req.user._id,
    };

    // If user is not admin, use their company name
    if (req.user.role !== "admin" && req.user.companyName) {
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

    // Check for duplicate job by title (optional - can be removed if not needed)
    const duplicateJob = await Job.findOne({
      title: new RegExp(`^${title}$`, "i"),
      companyName: new RegExp(`^${companyName}$`, "i"),
    });

    if (duplicateJob) {
      return res.status(400).json({
        success: false,
        message: "A job with this title and company already exists.",
      });
    }

    const job = await Job.create(jobData);
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
    } = req.query;

    const query = all ? {} : { status: "active" };

    // If status is specified, use it (for admin filtering)
    if (status && all) {
      query.status = status;
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

    const skip = (Number(page) - 1) * Number(limit);

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      salary: { salary: -1 },
    };

    const [jobs, total] = await Promise.all([
      Job.find(query)
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
    const job = await Job.findOne({ slug: req.params.slug });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ success: true, message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
