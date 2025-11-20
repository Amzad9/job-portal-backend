import mongoose from "mongoose";

const savedSearchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true }, // User-given name for the search
    // Search criteria
    title: { type: String, trim: true },
    location: { type: String, trim: true },
    country: { type: String, trim: true },
    jobProfile: { type: String, trim: true },
    workType: { type: String, trim: true },
    jobType: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    experienceLevel: { type: String, trim: true },
    remote: { type: Boolean },
    // Alert settings
    emailAlerts: { type: Boolean, default: true },
    alertFrequency: {
      type: String,
      enum: ["daily", "weekly", "instant"],
      default: "daily",
    },
    lastAlertSent: { type: Date },
    // Metadata
    isActive: { type: Boolean, default: true },
    matchCount: { type: Number, default: 0 }, // Number of matching jobs found
  },
  { timestamps: true }
);

savedSearchSchema.index({ user: 1, isActive: 1 });
savedSearchSchema.index({ user: 1, emailAlerts: 1, alertFrequency: 1 });

export default mongoose.model("SavedSearch", savedSearchSchema);

