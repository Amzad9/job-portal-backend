import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "canceled", "past_due", "trialing"],
      default: "active",
    },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    stripePriceId: { type: String },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    canceledAt: { type: Date },
    trialEnd: { type: Date },
    features: {
      jobPostsLimit: { type: Number, default: 3 }, // Free: 3, Pro: unlimited (-1), Enterprise: unlimited (-1)
      featuredJobsPerMonth: { type: Number, default: 0 }, // Free: 0, Pro: 2, Enterprise: unlimited (-1)
      analytics: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
      whiteLabel: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });

export default mongoose.model("Subscription", subscriptionSchema);

