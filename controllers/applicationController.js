import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { notifyNewApplication } from "./emailNotificationController.js";

// Create a new job application
export const createApplication = async (req, res) => {
  try {
    const { jobId, name, email, phone, resume, coverLetter, experience, skills } = req.body;

    // Check if user is authenticated (candidate)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please login as a candidate to apply",
      });
    }

    // Check if user is a candidate
    if (req.user.role !== "candidate") {
      return res.status(403).json({
        success: false,
        message: "Only candidates can apply for jobs",
      });
    }

    // Validate required fields
    if (!jobId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: "Job ID, name, and email are required",
      });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if job is active
    if (job.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This job is no longer accepting applications",
      });
    }

    // Check if candidate already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user._id,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      resume: resume?.trim(),
      coverLetter: coverLetter?.trim(),
      experience: experience?.trim(),
      skills: Array.isArray(skills) ? skills : skills?.split(",").map((s) => s.trim()).filter(Boolean) || [],
    });

    // Update job application count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    // Send email notification to job creator (async, don't wait)
    notifyNewApplication(application._id).catch((err) => {
      console.error("Failed to send application notification:", err);
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Error creating application:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error submitting application",
    });
  }
};

// Get applications for a specific job (for company/admin)
export const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Check if user is company or admin
    if (req.user.role !== "admin" && req.user.role !== "company") {
      return res.status(403).json({
        success: false,
        message: "Only companies and admins can view applications",
      });
    }

    // Check if job exists and user has permission
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // If user is company, check if they created this job
    if (req.user.role === "company" && job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only view applications for your own jobs",
      });
    }

    const applications = await Application.find({ job: jobId })
      .populate("candidate", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching applications",
    });
  }
};

// Get applications by candidate (for candidate to see their applications)
export const getMyApplications = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Check if user is a candidate
    if (req.user.role !== "candidate") {
      return res.status(403).json({
        success: false,
        message: "Only candidates can view their applications",
      });
    }

    const applications = await Application.find({ candidate: req.user._id })
      .populate("job", "title companyName location workType jobType status slug")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching applications",
    });
  }
};

// Update application status (for company/admin)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Check if user is company or admin
    if (req.user.role !== "admin" && req.user.role !== "company") {
      return res.status(403).json({
        success: false,
        message: "Only companies and admins can update application status",
      });
    }

    // Validate status
    const validStatuses = ["pending", "reviewed", "shortlisted", "rejected", "accepted"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Find application
    const application = await Application.findById(id).populate("job");
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // If user is company, check if they created the job
    if (req.user.role === "company" && application.job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update applications for your own jobs",
      });
    }

    // Update application
    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const updatedApplication = await Application.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("candidate", "name email phone")
      .populate("job", "title companyName");

    res.json({
      success: true,
      message: "Application status updated",
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating application",
    });
  }
};

// Check if candidate has applied for a job
export const checkApplication = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if user is authenticated
    if (!req.user) {
      return res.json({
        success: true,
        hasApplied: false,
      });
    }

    // Check if user is a candidate
    if (req.user.role !== "candidate") {
      return res.json({
        success: true,
        hasApplied: false,
      });
    }

    const application = await Application.findOne({
      job: jobId,
      candidate: req.user._id,
    });

    res.json({
      success: true,
      hasApplied: !!application,
      application: application || null,
    });
  } catch (error) {
    console.error("Error checking application:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error checking application",
    });
  }
};

