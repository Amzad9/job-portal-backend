import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: String, required: true, trim: true },
    authorRole: { type: String, trim: true },
    publishDate: { type: Date, default: Date.now, index: true },
    image: { type: String, required: true },
    category: { type: String, required: true, index: true },
    readTime: { type: String, default: "5 min read" },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
      index: true,
    },
    views: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

blogSchema.index({ title: "text", content: "text", excerpt: "text" });
blogSchema.index({ status: 1, publishDate: -1 });

export default mongoose.model("Blog", blogSchema);

