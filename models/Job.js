import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    companyName: { type: String, required: true, trim: true, index: true },
    companyLogo: String,
    location: { type: String, index: true },
    country: { type: String, index: true },
    postedTime: String,
    applyLink: { type: String, required: true },
    salary: String,
    workType: { type: String, default: "Remote", index: true },
    jobType: { type: String, default: "Full-time", index: true },
    aboutCompany: String,
    aboutRole: String,
    qualifications: [String],
    responsibilities: [String],
    benefits: [String],
    equalOpportunity: String,
    skills: { type: [String], index: true },
    experienceLevel: { type: String, index: true },
    isFeatured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "expired", "draft"],
      default: "active",
      index: true,
    },
    source: { type: String, default: "Company Website" },
    slug: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

jobSchema.index({ country: 1, workType: 1, jobType: 1 });
jobSchema.index({ title: "text", companyName: "text", aboutRole: "text" });

export default mongoose.model("Job", jobSchema);
