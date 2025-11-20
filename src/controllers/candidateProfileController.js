import CandidateProfile from "../models/CandidateProfile.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Create or update candidate profile
export const createOrUpdateProfile = async (req, res) => {
  try {
    // Only candidates can create profiles
    if (req.user.role !== "candidate") {
      return res.status(403).json({
        success: false,
        message: "Only candidates can create profiles",
      });
    }

    let profile = await CandidateProfile.findOne({ user: req.user._id });

    if (profile) {
      // Update existing profile
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          profile[key] = req.body[key];
        }
      });
      await profile.save();
    } else {
      // Create new profile
      profile = await CandidateProfile.create({
        user: req.user._id,
        ...req.body,
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error creating/updating profile",
    });
  }
};

// Get current user's profile
export const getMyProfile = async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ user: req.user._id }).populate(
      "user",
      "email name"
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found. Create one first.",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching profile",
    });
  }
};

// Get public profile by slug
export const getPublicProfile = async (req, res) => {
  try {
    const { slug } = req.params;

    const profile = await CandidateProfile.findOne({
      publicSlug: slug,
      isPublic: true,
    })
      .populate("user", "email name")
      .select("-user.email"); // Don't expose email in public profile

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Increment profile views
    profile.profileViews += 1;
    await profile.save();

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching profile",
    });
  }
};

// Search candidate profiles (for companies with access)
export const searchProfiles = async (req, res) => {
  try {
    // Only companies and admins can search profiles
    if (req.user.role !== "company" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only companies can search candidate profiles",
      });
    }

    // TODO: Check if user has subscription with resume database access
    // For now, allow all companies

    const {
      skills,
      location,
      country,
      experienceLevel,
      yearsOfExperience,
      page = 1,
      limit = 20,
      keyword,
    } = req.query;

    const query = { isPublic: true };

    if (skills) {
      const skillArray = Array.isArray(skills) ? skills : skills.split(",").map((s) => s.trim());
      query.skills = { $in: skillArray };
    }
    if (location) {
      query.location = new RegExp(location, "i");
    }
    if (country) {
      query.country = new RegExp(country, "i");
    }
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }
    if (yearsOfExperience) {
      query.yearsOfExperience = { $gte: parseInt(yearsOfExperience) };
    }
    if (keyword) {
      query.$or = [
        { headline: { $regex: keyword, $options: "i" } },
        { bio: { $regex: keyword, $options: "i" } },
        { skills: { $regex: keyword, $options: "i" } },
        { currentTitle: { $regex: keyword, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [profiles, total] = await Promise.all([
      CandidateProfile.find(query)
        .populate("user", "name")
        .select("-user.email -resume") // Don't expose email and resume in search
        .sort({ profileViews: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      CandidateProfile.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      profiles,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error searching profiles",
    });
  }
};

// Upload resume
export const uploadResume = async (req, res) => {
  try {
    if (req.user.role !== "candidate") {
      return res.status(403).json({
        success: false,
        message: "Only candidates can upload resumes",
      });
    }

    // TODO: Implement file upload (multer, cloud storage, etc.)
    // For now, just accept URL
    const { resumeUrl, fileName } = req.body;

    let profile = await CandidateProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await CandidateProfile.create({ user: req.user._id });
    }

    profile.resume = resumeUrl;
    profile.resumeFileName = fileName;
    await profile.save();

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error uploading resume",
    });
  }
};

