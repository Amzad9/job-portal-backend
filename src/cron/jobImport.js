import cron from "node-cron";
import { importJobsFromAdzuna } from "../services/adzunaService.js";

// Schedule job import every 3 hours
// Cron format: "0 */3 * * *" means "at minute 0 of every 3rd hour"
// You can customize this:
// - "0 */6 * * *" = every 6 hours
// - "0 0 * * *" = once daily at midnight
// - "0 0 */2 * *" = every 2 days at midnight
// - "*/30 * * * *" = every 30 minutes

const JOB_IMPORT_SCHEDULE = process.env.ADZUNA_IMPORT_SCHEDULE || "0 */3 * * *";

console.log(`Setting up Adzuna job import cron job with schedule: ${JOB_IMPORT_SCHEDULE}`);

// Import jobs from Adzuna API
cron.schedule(JOB_IMPORT_SCHEDULE, async () => {
  console.log(`[${new Date().toISOString()}] Starting scheduled Adzuna job import...`);
  
  try {
    // Import jobs from multiple countries (you can customize this)
    const countries = process.env.ADZUNA_IMPORT_COUNTRIES 
      ? process.env.ADZUNA_IMPORT_COUNTRIES.split(",").map(c => c.trim())
      : ["us"]; // Default to US only

    let totalImported = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const country of countries) {
      console.log(`Importing jobs for country: ${country}`);
      
      const result = await importJobsFromAdzuna({
        country: country,
        resultsPerPage: parseInt(process.env.ADZUNA_RESULTS_PER_PAGE || "50"),
        page: 1,
      });

      if (result.success) {
        totalImported += result.imported;
        totalSkipped += result.skipped;
        totalErrors += result.errors;
        console.log(`Country ${country}: ${result.message}`);
      } else {
        totalErrors++;
        console.error(`Country ${country}: ${result.message}`);
      }

      // Small delay between countries to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`[${new Date().toISOString()}] Adzuna import completed. Total: ${totalImported} imported, ${totalSkipped} skipped, ${totalErrors} errors`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in scheduled Adzuna import:`, error);
  }
}, {
  scheduled: true,
  timezone: "UTC",
});

// Optional: Run import immediately on server start (for testing)
if (process.env.ADZUNA_IMPORT_ON_START === "true") {
  console.log("Running initial Adzuna job import on server start...");
  setTimeout(async () => {
    try {
      const result = await importJobsFromAdzuna({
        country: "us",
        resultsPerPage: 20, // Smaller batch on startup
        page: 1,
      });
      console.log("Initial import result:", result.message);
    } catch (error) {
      console.error("Error in initial import:", error);
    }
  }, 5000); // Wait 5 seconds after server start
}

export default cron;

