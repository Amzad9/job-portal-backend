import mongoose from "mongoose";

const candidateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    // Personal Information
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    headline: { type: String, trim: true }, // Professional headline
    bio: { type: String, trim: true }, // About me
    profileImage: { type: String },
    resume: { type: String }, // URL to uploaded resume
    resumeFileName: { type: String },
    // Contact
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    country: { type: String, trim: true },
    website: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    portfolio: { type: String, trim: true },
    // Professional Details
    currentTitle: { type: String, trim: true },
    currentCompany: { type: String, trim: true },
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "executive"],
      trim: true,
    },
    yearsOfExperience: { type: Number, default: 0 },
    // Skills
    skills: [{ type: String, trim: true, index: true }],
    // Education
    education: [
      {
        degree: { type: String, trim: true },
        field: { type: String, trim: true },
        institution: { type: String, trim: true },
        startDate: { type: Date },
        endDate: { type: Date },
        current: { type: Boolean, default: false },
      },
    ],
    // Work Experience
    experience: [
      {
        title: { type: String, trim: true, required: true },
        company: { type: String, trim: true, required: true },
        location: { type: String, trim: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        current: { type: Boolean, default: false },
        description: { type: String, trim: true },
      },
    ],
    // Certifications
    certifications: [
      {
        name: { type: String, trim: true, required: true },
        issuer: { type: String, trim: true },
        issueDate: { type: Date },
        expiryDate: { type: Date },
        credentialId: { type: String, trim: true },
        credentialUrl: { type: String, trim: true },
      },
    ],
    // Portfolio/Projects
    projects: [
      {
        title: { type: String, trim: true, required: true },
        description: { type: String, trim: true },
        url: { type: String, trim: true },
        technologies: [{ type: String, trim: true }],
        startDate: { type: Date },
        endDate: { type: Date },
      },
    ],
    // Preferences
    preferredJobTypes: [{ type: String, trim: true }], // Full-time, Part-time, etc.
    preferredWorkTypes: [{ type: String, trim: true }], // Remote, Hybrid, On-site
    preferredLocations: [{ type: String, trim: true }],
    salaryExpectation: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "USD" },
    },
    // Visibility
    isPublic: { type: Boolean, default: true },
    publicSlug: { type: String, unique: true, sparse: true, index: true },
    // Stats
    profileViews: { type: Number, default: 0 },
    // Skills endorsements (future feature)
    endorsements: [
      {
        skill: { type: String, trim: true },
        endorsedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Generate public slug before saving
candidateProfileSchema.pre("save", async function (next) {
  if (this.isPublic && !this.publicSlug) {
    const user = await mongoose.model("User").findById(this.user);
    const baseSlug = user?.name || user?.email?.split("@")[0] || "candidate";
    let slug = baseSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    let counter = 1;
    let existing = await mongoose.model("CandidateProfile").findOne({ publicSlug: slug });
    while (existing && existing._id.toString() !== this._id.toString()) {
      slug = `${baseSlug}-${counter}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      existing = await mongoose.model("CandidateProfile").findOne({ publicSlug: slug });
      counter++;
    }
    this.publicSlug = slug;
  }
  next();
});

candidateProfileSchema.index({ skills: 1 });
candidateProfileSchema.index({ location: 1, country: 1 });
candidateProfileSchema.index({ experienceLevel: 1 });
candidateProfileSchema.index({ isPublic: 1, publicSlug: 1 });

export default mongoose.model("CandidateProfile", candidateProfileSchema);

