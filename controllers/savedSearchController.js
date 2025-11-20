import SavedSearch from "../models/SavedSearch.js";
import Job from "../models/Job.js";
import { sendEmail } from "../utils/sendEmail.js";

// Create or update saved search
export const saveSearch = async (req, res) => {
  try {
    const {
      name,
      title,
      location,
      country,
      jobProfile,
      workType,
      jobType,
      skills,
      salaryMin,
      salaryMax,
      experienceLevel,
      remote,
      emailAlerts,
      alertFrequency,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Search name is required",
      });
    }

    const searchData = {
      user: req.user._id,
      name,
      title,
      location,
      country,
      jobProfile,
      workType,
      jobType,
      skills: Array.isArray(skills) ? skills : skills ? skills.split(",").map((s) => s.trim()) : [],
      salaryMin: salaryMin ? parseFloat(salaryMin) : undefined,
      salaryMax: salaryMax ? parseFloat(salaryMax) : undefined,
      experienceLevel,
      remote,
      emailAlerts: emailAlerts !== undefined ? emailAlerts : true,
      alertFrequency: alertFrequency || "daily",
    };

    const savedSearch = await SavedSearch.create(searchData);

    // Count initial matches
    const matchCount = await countMatchingJobs(savedSearch);
    savedSearch.matchCount = matchCount;
    await savedSearch.save();

    res.status(201).json({
      success: true,
      savedSearch,
      matchCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error saving search",
    });
  }
};

// Get user's saved searches
export const getSavedSearches = async (req, res) => {
  try {
    const savedSearches = await SavedSearch.find({
      user: req.user._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      savedSearches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching saved searches",
    });
  }
};

// Update saved search
export const updateSavedSearch = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const savedSearch = await SavedSearch.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        message: "Saved search not found",
      });
    }

    // Update fields
    Object.keys(updates).forEach((key) => {
      if (key === "skills" && typeof updates[key] === "string") {
        savedSearch[key] = updates[key].split(",").map((s) => s.trim());
      } else if (key === "salaryMin" || key === "salaryMax") {
        savedSearch[key] = updates[key] ? parseFloat(updates[key]) : undefined;
      } else {
        savedSearch[key] = updates[key];
      }
    });

    // Recalculate match count
    const matchCount = await countMatchingJobs(savedSearch);
    savedSearch.matchCount = matchCount;
    await savedSearch.save();

    res.status(200).json({
      success: true,
      savedSearch,
      matchCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error updating saved search",
    });
  }
};

// Delete saved search
export const deleteSavedSearch = async (req, res) => {
  try {
    const { id } = req.params;

    const savedSearch = await SavedSearch.findOneAndUpdate(
      {
        _id: id,
        user: req.user._id,
      },
      { isActive: false },
      { new: true }
    );

    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        message: "Saved search not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Saved search deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting saved search",
    });
  }
};

// Get matching jobs for a saved search
export const getMatchingJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const savedSearch = await SavedSearch.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        message: "Saved search not found",
      });
    }

    const jobs = await findMatchingJobs(savedSearch, page, limit);

    res.status(200).json({
      success: true,
      jobs: jobs.jobs,
      total: jobs.total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching matching jobs",
    });
  }
};

// Helper function to count matching jobs
async function countMatchingJobs(savedSearch) {
  const query = buildSearchQuery(savedSearch);
  return await Job.countDocuments(query);
}

// Helper function to find matching jobs
async function findMatchingJobs(savedSearch, page = 1, limit = 20) {
  const query = buildSearchQuery(savedSearch);
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .sort({ createdAt: -1, isFeatured: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("createdBy", "companyName name role"),
    Job.countDocuments(query),
  ]);

  return { jobs, total };
}

// Helper function to build search query
function buildSearchQuery(savedSearch) {
  const query = { status: "active" };

  if (savedSearch.title) {
    query.title = new RegExp(savedSearch.title, "i");
  }
  if (savedSearch.location) {
    query.location = new RegExp(savedSearch.location, "i");
  }
  if (savedSearch.country) {
    query.country = new RegExp(savedSearch.country, "i");
  }
  if (savedSearch.jobProfile) {
    query.jobProfile = new RegExp(savedSearch.jobProfile, "i");
  }
  if (savedSearch.workType) {
    query.workType = new RegExp(savedSearch.workType, "i");
  }
  if (savedSearch.jobType) {
    query.jobType = new RegExp(savedSearch.jobType, "i");
  }
  if (savedSearch.skills && savedSearch.skills.length > 0) {
    query.skills = { $in: savedSearch.skills };
  }
  if (savedSearch.experienceLevel) {
    query.experienceLevel = new RegExp(savedSearch.experienceLevel, "i");
  }
  if (savedSearch.remote) {
    query.workType = "Remote";
  }

  // Salary filtering (if salary is stored as string, we'll need to parse it)
  // This is a simplified version - you may need to enhance based on your salary format
  if (savedSearch.salaryMin || savedSearch.salaryMax) {
    // Note: This assumes salary is stored as a parseable string
    // You may need to adjust based on your actual salary format
    query.salary = { $exists: true, $ne: "" };
  }

  return query;
}

// Send job alerts (to be called by cron job)
export const sendJobAlerts = async () => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all active saved searches with email alerts enabled
    const savedSearches = await SavedSearch.find({
      isActive: true,
      emailAlerts: true,
    }).populate("user", "email name");

    for (const search of savedSearches) {
      let shouldSend = false;

      // Check alert frequency
      if (search.alertFrequency === "instant") {
        shouldSend = true; // Send immediately (for new jobs)
      } else if (search.alertFrequency === "daily") {
        if (!search.lastAlertSent || search.lastAlertSent < oneDayAgo) {
          shouldSend = true;
        }
      } else if (search.alertFrequency === "weekly") {
        if (!search.lastAlertSent || search.lastAlertSent < oneWeekAgo) {
          shouldSend = true;
        }
      }

      if (shouldSend) {
        // Find new matching jobs (created since last alert)
        const query = buildSearchQuery(search);
        if (search.lastAlertSent) {
          query.createdAt = { $gt: search.lastAlertSent };
        } else {
          // First time: get jobs from last 7 days
          query.createdAt = { $gt: oneWeekAgo };
        }

        const newJobs = await Job.find(query)
          .sort({ createdAt: -1 })
          .limit(10)
          .populate("createdBy", "companyName");

        if (newJobs.length > 0) {
          // Send email alert
          const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
          const searchUrl = `${frontendUrl}/?${buildSearchUrl(search)}`;

          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0074b7;">New Jobs Matching Your Search: ${search.name}</h2>
              <p>We found ${newJobs.length} new job${newJobs.length > 1 ? "s" : ""} that match your saved search criteria.</p>
              <ul style="list-style: none; padding: 0;">
                ${newJobs
                  .map(
                    (job) => `
                  <li style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                    <h3 style="margin: 0 0 10px 0;"><a href="${frontendUrl}/${job.slug}" style="color: #0074b7; text-decoration: none;">${job.title}</a></h3>
                    <p style="margin: 5px 0; color: #666;">${job.companyName} - ${job.location || ""}</p>
                    ${job.salary ? `<p style="margin: 5px 0; color: #666;">Salary: ${job.salary}</p>` : ""}
                  </li>
                `
                  )
                  .join("")}
              </ul>
              <p style="margin-top: 30px;">
                <a href="${searchUrl}" style="background-color: #0074b7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View All Matching Jobs</a>
              </p>
              <p style="color: #666; font-size: 12px; margin-top: 30px;">
                You're receiving this because you have email alerts enabled for this search.
                <a href="${frontendUrl}/account">Manage your saved searches</a>
              </p>
            </div>
          `;

          await sendEmail({
            email: search.user.email,
            subject: `${newJobs.length} New Job${newJobs.length > 1 ? "s" : ""} Matching "${search.name}"`,
            html: emailHtml,
          });

          // Update last alert sent time
          search.lastAlertSent = now;
          await search.save();
        }
      }
    }

    console.log(`✅ Job alerts sent for ${savedSearches.length} saved searches`);
  } catch (error) {
    console.error("❌ Error sending job alerts:", error);
  }
};

// Helper to build search URL
function buildSearchUrl(search) {
  const params = new URLSearchParams();
  if (search.title) params.append("title", search.title);
  if (search.location) params.append("location", search.location);
  if (search.country) params.append("country", search.country);
  if (search.jobProfile) params.append("jobProfile", search.jobProfile);
  if (search.workType) params.append("workType", search.workType);
  if (search.jobType) params.append("jobType", search.jobType);
  if (search.skills && search.skills.length > 0) params.append("skills", search.skills.join(","));
  return params.toString();
}

