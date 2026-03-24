import mongoose from "mongoose";
import { generateUniqueSlug } from "../utils/slug.utils.js";

const emailTemplateSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, unique: true, trim: true },
    slug:      { type: String, required: true, unique: true, lowercase: true },
    subject:   { type: String, required: true },
    htmlBody:  { type: String, required: true },
    textBody:  { type: String },
    variables: [{ name: String, description: String, defaultValue: String }],
    category: {
      type:    String,
      enum:    ["transactional", "marketing"],
      default: "transactional",
    },
    isSystem:  { type: Boolean, default: false },
    isActive:  { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

emailTemplateSchema.pre("validate", async function autoGenerateSlug(next) {
  try {
    if (this.isNew || this.isModified("name")) {
      this.slug = await generateUniqueSlug(this.name, this.constructor, this._id);
    }
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("EmailTemplate", emailTemplateSchema);