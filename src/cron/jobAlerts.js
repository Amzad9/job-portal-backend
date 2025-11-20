import cron from "node-cron";
import { sendJobAlerts } from "../controllers/savedSearchController.js";

// Run job alerts daily at 9 AM
cron.schedule("0 9 * * *", async () => {
  console.log("🔄 Running daily job alerts...");
  try {
    await sendJobAlerts();
    console.log("✅ Job alerts completed");
  } catch (error) {
    console.error("❌ Error running job alerts:", error);
  }
});

// Also run for instant alerts every hour (for instant frequency)
cron.schedule("0 * * * *", async () => {
  console.log("🔄 Checking for instant job alerts...");
  try {
    // This will only send alerts for searches with instant frequency
    await sendJobAlerts();
  } catch (error) {
    console.error("❌ Error running instant job alerts:", error);
  }
});

console.log("✅ Job alerts cron job scheduled");

