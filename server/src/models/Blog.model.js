import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true, trim: true },
    slug:         { type: String, required: true, unique: true, lowercase: true },
    content:      { type: String, required: true },
    excerpt:      { type: String, maxlength: 300 },
    coverImage:   { type: String, default: null },
    author:       { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    categories:   [{ type: String, trim: true }],
    tags:         [{ type: String, trim: true }],
    status:       { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    isFeatured:   { type: Boolean, default: false },
    viewCount:    { type: Number, default: 0 },
    likeCount:    { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    readTime:     { type: Number, default: 0 },
    publishedAt:  { type: Date, default: null },
    meta: {
      title:       String,
      description: String,
      keywords:    [String],
    },
  },
  { timestamps: true }
);

blogSchema.index({ title: "text", content: "text" });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ categories: 1 });
blogSchema.index({ tags: 1 });

export default mongoose.model("Blog", blogSchema);