import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    views: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    date: { type: Date, default: Date.now, index: true },
    // Track views by date for trends
    dailyViews: [
      {
        date: { type: Date },
        count: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

analyticsSchema.index({ job: 1, date: -1 });

export default mongoose.model("Analytics", analyticsSchema);

