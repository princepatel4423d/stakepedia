import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  content:   { type: String, required: true },
  videoUrl:  { type: String, default: null },
  duration:  { type: Number, default: 0 },
  order:     { type: Number, default: 0 },
  isFree:    { type: Boolean, default: false },
  resources: [{ title: String, url: String }],
});

const courseSchema = new mongoose.Schema(
  {
    title:            { type: String, required: true, trim: true },
    slug:             { type: String, required: true, unique: true, lowercase: true },
    description:      { type: String, required: true },
    shortDescription: { type: String, maxlength: 200 },
    coverImage:       { type: String, default: null },
    instructor:       { type: String, required: true },
    level:            { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    category:         { type: String, required: true },
    tags:             [{ type: String, trim: true }],
    lessons:          [lessonSchema],
    pricing:          { type: String, enum: ["free", "paid"], default: "free" },
    price:            { type: Number, default: 0 },
    status:           { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    isFeatured:       { type: Boolean, default: false },
    enrollmentCount:  { type: Number, default: 0 },
    averageRating:    { type: Number, default: 0 },
    reviewCount:      { type: Number, default: 0 },
    totalDuration:    { type: Number, default: 0 },
    addedBy:          { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    meta: {
      title:       String,
      description: String,
    },
  },
  { timestamps: true }
);

courseSchema.index({ title: "text", description: "text", shortDescription: "text" });
courseSchema.index({ status: 1, publishedAt: -1 });

export default mongoose.model("Course", courseSchema);