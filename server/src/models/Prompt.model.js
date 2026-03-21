import mongoose from "mongoose";

const promptSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true },
    content:     { type: String, required: true },
    description: { type: String },
    category:    { type: String, required: true },
    categories:  [{ type: String, trim: true }],
    tags:        [{ type: String, trim: true }],
    tool:        { type: mongoose.Schema.Types.ObjectId, ref: "AITool", default: null },
    tools:       [{ type: mongoose.Schema.Types.ObjectId, ref: "AITool" }],
    variables:   [{ name: String, description: String, example: String }],
    status:      { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    publishedAt: { type: Date, default: null },
    isFeatured:  { type: Boolean, default: false },
    usageCount:  { type: Number, default: 0 },
    likeCount:   { type: Number, default: 0 },
    addedBy:     { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

promptSchema.index({ title: "text", content: "text" });
promptSchema.index({ category: 1, status: 1 });
promptSchema.index({ categories: 1, status: 1 });
promptSchema.index({ tool: 1, status: 1 });
promptSchema.index({ tools: 1, status: 1 });

export default mongoose.model("Prompt", promptSchema);