import Job from "../models/Job.js";

export const createJob = async (req, res) => {
  try {
    const { title, companyName, location } = req.body;

    const existingJob = await Job.findOne({
      title: new RegExp(`^${title}$`, "i"),
      // companyName: new RegExp(`^${companyName}$`, "i"),
      // location: new RegExp(`^${location}$`, "i"),
    });

    if (existingJob) {
      return res.status(400).json({
        success: false,
        message: "Duplicate job detected: This job already exists.",
      });
    }

    const job = await Job.create(req.body);
    res.status(201).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
