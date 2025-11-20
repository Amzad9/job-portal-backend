import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, index: true },
    phone: { type: String, trim: true },
    resume: { type: String }, // URL or file path
    coverLetter: { type: String },
    experience: { type: String },
    skills: [String],
    status: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected", "accepted"],
      default: "pending",
      index: true,
    },
    notes: { type: String }, // Internal notes for company/admin
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, candidate: 1 }); // Prevent duplicate applications
applicationSchema.index({ candidate: 1, createdAt: -1 });
applicationSchema.index({ job: 1, status: 1 });

export default mongoose.model("Application", applicationSchema);

