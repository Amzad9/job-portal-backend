import axios from "axios";
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

// Map Adzuna job data to our Job model format
const mapAdzunaJobToJobModel = (adzunaJob) => {
  // Extract location information
  const location = adzunaJob.location?.display_name || adzunaJob.location?.area?.[0] || "";
  const country = adzunaJob.location?.country || "Unknown";

  // Extract salary information
  let salary = "";
  if (adzunaJob.salary_min || adzunaJob.salary_max) {
    const min = adzunaJob.salary_min ? `$${adzunaJob.salary_min.toLocaleString()}` : "";
    const max = adzunaJob.salary_max ? `$${adzunaJob.salary_max.toLocaleString()}` : "";
    salary = min && max ? `${min} - ${max}` : min || max || "Not specified";
  }

  // Extract work type (contract_type from Adzuna)
  const workType = adzunaJob.contract_type === "full_time" ? "Full-time" : 
                   adzunaJob.contract_type === "part_time" ? "Part-time" : 
                   adzunaJob.contract_type === "contract" ? "Contract" : 
                   adzunaJob.contract_type === "permanent" ? "Permanent" : 
                   "Full-time"; // Default

  // Extract job type
  const jobType = adzunaJob.contract_time === "full_time" ? "Full-time" :
                  adzunaJob.contract_time === "part_time" ? "Part-time" :
                  "Full-time"; // Default

  // Generate unique slug from title and external ID
  const baseSlug = generateSlug(adzunaJob.title);
  const slug = `${baseSlug}-adzuna-${adzunaJob.id}`;

  // Extract skills from category tags if available
  const skills = adzunaJob.category?.tag || [];

  // Extract description
  const description = adzunaJob.description || adzunaJob.redirect_url || "";

  return {
    title: adzunaJob.title,
    companyName: adzunaJob.company?.display_name || "Unknown Company",
    location: location,
    country: country,
    salary: salary,
    workType: workType,
    jobType: jobType,
    aboutRole: description,
    skills: Array.isArray(skills) ? skills : [],
    applyLink: adzunaJob.redirect_url || adzunaJob.url || "",
    slug: slug,
    externalId: adzunaJob.id?.toString(),
    externalSource: "adzuna",
    source: "Adzuna API",
    status: "active",
    postedTime: adzunaJob.created ? new Date(adzunaJob.created).toISOString() : new Date().toISOString(),
    // Optional fields
    experience: adzunaJob.category?.label || "",
    jobProfile: adzunaJob.category?.tag?.[0] || "",
  };
};

// Import jobs from Adzuna API
export const importJobsFromAdzuna = async (options = {}) => {
  const {
    country = "us", // Default to US, can be changed
    resultsPerPage = 50,
    page = 1,
    what = "", // Job title/keywords
    where = "", // Location
  } = options;

  try {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      throw new Error("Adzuna API credentials not configured. Please set ADZUNA_APP_ID and ADZUNA_APP_KEY in .env");
    }

    // Build API URL
    const baseUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`;
    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      results_per_page: resultsPerPage.toString(),
    });

    if (what) params.append("what", what);
    if (where) params.append("where", where);

    const apiUrl = `${baseUrl}?${params.toString()}`;

    console.log(`Fetching jobs from Adzuna API: ${apiUrl.replace(appKey, "***")}`);

    const response = await axios.get(apiUrl);

    if (!response.data || !response.data.results) {
      console.warn("No results from Adzuna API");
      return {
        success: true,
        imported: 0,
        skipped: 0,
        errors: 0,
        message: "No jobs found in API response",
      };
    }

    const jobs = response.data.results;
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    console.log(`Processing ${jobs.length} jobs from Adzuna...`);

    for (const adzunaJob of jobs) {
      try {
        // Check if job already exists by external ID
        const existingJob = await Job.findOne({
          externalId: adzunaJob.id?.toString(),
          externalSource: "adzuna",
        });

        if (existingJob) {
          skipped++;
          continue;
        }

        // Map Adzuna job to our Job model
        const jobData = mapAdzunaJobToJobModel(adzunaJob);

        // Double-check for duplicate slug
        const existingSlug = await Job.findOne({ slug: jobData.slug });
        if (existingSlug) {
          // Generate alternative slug
          let counter = 1;
          let newSlug = `${jobData.slug}-${counter}`;
          while (await Job.findOne({ slug: newSlug })) {
            counter++;
            newSlug = `${jobData.slug}-${counter}`;
          }
          jobData.slug = newSlug;
        }

        // Create job (no createdBy for imported jobs)
        await Job.create(jobData);
        imported++;
      } catch (error) {
        errors++;
        console.error(`Error importing job ${adzunaJob.id}:`, error.message);
        // Continue with next job
      }
    }

    const result = {
      success: true,
      imported,
      skipped,
      errors,
      total: jobs.length,
      message: `Imported ${imported} jobs, skipped ${skipped} duplicates, ${errors} errors`,
    };

    console.log(`Adzuna import completed: ${result.message}`);
    return result;
  } catch (error) {
    console.error("Error importing jobs from Adzuna:", error);
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: 0,
      message: error.message || "Failed to import jobs from Adzuna",
    };
  }
};

// Get available countries from Adzuna (helper function)
export const getAdzunaCountries = () => {
  return [
    { code: "us", name: "United States" },
    { code: "gb", name: "United Kingdom" },
    { code: "au", name: "Australia" },
    { code: "ca", name: "Canada" },
    { code: "de", name: "Germany" },
    { code: "at", name: "Austria" },
    { code: "be", name: "Belgium" },
    { code: "ch", name: "Switzerland" },
    { code: "es", name: "Spain" },
    { code: "fr", name: "France" },
    { code: "ie", name: "Ireland" },
    { code: "it", name: "Italy" },
    { code: "mx", name: "Mexico" },
    { code: "nl", name: "Netherlands" },
    { code: "nz", name: "New Zealand" },
    { code: "pl", name: "Poland" },
    { code: "sg", name: "Singapore" },
    { code: "za", name: "South Africa" },
  ];
};

