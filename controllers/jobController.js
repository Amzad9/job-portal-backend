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
      location,
      country,
      workType,
      jobType,
      skills,
      keyword,
      page = 1,
      limit = 20,
      sort = "newest",
    } = req.query;

    const query = { status: "active" };

    if (location) query.location = new RegExp(location, "i");
    if (country) query.country = new RegExp(country, "i");
    if (workType) query.workType = new RegExp(workType, "i");
    if (jobType) query.jobType = new RegExp(jobType, "i");
    if (skills) query.skills = { $in: skills.split(",") };
    if (keyword) query.$text = { $search: keyword };

    const skip = (page - 1) * limit;

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

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
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
