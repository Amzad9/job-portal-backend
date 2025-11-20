import { importJobsFromAdzuna, getAdzunaCountries } from "../services/adzunaService.js";
import Job from "../models/Job.js";
import axios from "axios";

// Manual import endpoint (for admin)
export const manualImport = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can manually import jobs",
      });
    }

    const {
      country = "us",
      resultsPerPage = 50,
      page = 1,
      what = "",
      where = "",
    } = req.body;

    const result = await importJobsFromAdzuna({
      country,
      resultsPerPage,
      page,
      what,
      where,
    });

    if (result.success) {
      res.json({
        success: true,
        ...result,
      });
    } else {
      res.status(500).json({
        success: false,
        ...result,
      });
    }
  } catch (error) {
    console.error("Error in manual import:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to import jobs",
    });
  }
};

// Get import statistics
export const getImportStats = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can view import statistics",
      });
    }

    const [totalImported, recentImported] = await Promise.all([
      Job.countDocuments({ externalSource: "adzuna" }),
      Job.countDocuments({
        externalSource: "adzuna",
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
      }),
    ]);

    res.json({
      success: true,
      stats: {
        totalImported,
        recentImported,
        countries: getAdzunaCountries(),
      },
    });
  } catch (error) {
    console.error("Error getting import stats:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get import statistics",
    });
  }
};

// Fetch jobs directly from Adzuna API (for frontend display)
export const fetchAdzunaJobs = async (req, res) => {
  try {
    const {
      country = "us",
      page = 1,
      resultsPerPage = 20,
      what = "", // Job title/keywords
      where = "", // Location
      sortBy = "date", // date, salary, relevance
      remote = false, // Filter for remote jobs
    } = req.query;

    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      return res.status(500).json({
        success: false,
        message: "Adzuna API credentials not configured",
      });
    }

    // Build Adzuna API URL
    const baseUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`;
    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      results_per_page: resultsPerPage.toString(),
      sort_by: sortBy,
    });

    if (what) params.append("what", what);
    if (where) params.append("where", where);

    const apiUrl = `${baseUrl}?${params.toString()}`;

    console.log(`Fetching Adzuna jobs from: ${apiUrl.replace(appKey, "***")}`);

    const response = await axios.get(apiUrl, {
      timeout: 10000, // 10 second timeout
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors
    });

    // Check for API errors
    if (response.status !== 200) {
      console.error("Adzuna API error:", response.status, response.data);
      return res.status(response.status).json({
        success: false,
        message: response.data?.error || `Adzuna API returned status ${response.status}`,
        details: response.data,
      });
    }

    if (!response.data) {
      return res.status(500).json({
        success: false,
        message: "Invalid response from Adzuna API",
      });
    }

    // Check if results array exists
    if (!response.data.results || !Array.isArray(response.data.results)) {
      console.warn("No results in Adzuna API response:", response.data);
      return res.json({
        success: true,
        jobs: [],
        count: 0,
        message: "No jobs found",
        debug: process.env.NODE_ENV === "development" ? response.data : undefined,
      });
    }

    // Map Adzuna jobs to a simpler format for frontend
    let mappedJobs = response.data.results.map((job) => {
      // Format salary
      let salary = "Not specified";
      if (job.salary_min || job.salary_max) {
        const min = job.salary_min ? `$${Math.round(job.salary_min).toLocaleString()}` : "";
        const max = job.salary_max ? `$${Math.round(job.salary_max).toLocaleString()}` : "";
        salary = min && max ? `${min} - ${max}` : min || max || "Not specified";
      }

      // Get location
      const location = job.location?.display_name || 
                      (job.location?.area && job.location.area.length > 0 ? job.location.area[job.location.area.length - 1] : "") ||
                      "";

      // Check if job is remote
      const isRemote = location.toLowerCase().includes("remote") || 
                      location.toLowerCase().includes("work from home") ||
                      job.location?.area?.some((area) => area.toLowerCase().includes("remote")) ||
                      false;

      return {
        id: job.id?.toString() || "",
        title: job.title || "Untitled Job",
        companyName: job.company?.display_name || "Unknown Company",
        location: isRemote ? "Remote" : location,
        country: job.location?.country || job.location?.area?.[0] || country,
        salary: salary,
        workType: isRemote ? "Remote" :
                  job.contract_type === "full_time" ? "Full-time" :
                  job.contract_type === "part_time" ? "Part-time" :
                  job.contract_type === "contract" ? "Contract" :
                  job.contract_type === "permanent" ? "Permanent" : "Full-time",
        jobType: job.contract_time === "full_time" ? "Full-time" :
                 job.contract_time === "part_time" ? "Part-time" : "Full-time",
        description: job.description || "",
        applyLink: job.redirect_url || job.url || "",
        postedDate: job.created || new Date().toISOString(),
        category: job.category?.label || "",
        skills: Array.isArray(job.category?.tag) ? job.category.tag : 
                (job.category?.tag ? [job.category.tag] : []),
        source: "Adzuna",
        externalId: job.id?.toString() || "",
        externalSource: "adzuna",
        isRemote: isRemote,
      };
    });

    // Note: Remote jobs are included in the main results
    // The frontend can filter them using the showRemoteOnly toggle

    res.json({
      success: true,
      jobs: mappedJobs,
      count: mappedJobs.length,
      total: response.data.count || mappedJobs.length,
      page: parseInt(page),
      totalPages: Math.ceil((response.data.count || mappedJobs.length) / parseInt(resultsPerPage)),
    });
  } catch (error) {
    console.error("Error fetching Adzuna jobs:", error);
    
    // More detailed error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Adzuna API Response Error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
      
      return res.status(error.response.status || 500).json({
        success: false,
        message: error.response.data?.error || error.response.data?.message || `Adzuna API error: ${error.response.statusText}`,
        status: error.response.status,
        details: process.env.NODE_ENV === "development" ? error.response.data : undefined,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response from Adzuna API:", error.request);
      return res.status(503).json({
        success: false,
        message: "No response from Adzuna API. Please check your internet connection and try again.",
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request setup error:", error.message);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch jobs from Adzuna",
      });
    }
  }
};

