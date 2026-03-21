import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, unique: true, trim: true },
    slug:      { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: null },
    icon:      { type: String, default: null },
    color:     { type: String, default: "#6366f1" },
    isActive:  { type: Boolean, default: true },
    toolCount: { type: Number, default: 0 },
    meta: {
      title: { type: String, default: null },
      description: { type: String, default: null },
      keywords: [{ type: String }],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);