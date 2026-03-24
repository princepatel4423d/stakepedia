import mongoose from "mongoose";

const tutorialSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true, trim: true },
    youtubeUrl:   { type: String, required: true, trim: true },
    channelName:  { type: String, default: null },
    durationText: { type: String, default: null },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "all"],
      default: "all",
    },
    language:   { type: String, default: "English" },
    sortOrder:  { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { _id: false }
);

const pricingPlanSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    priceLabel:  { type: String, required: true, trim: true },
    billingNote: { type: String, default: null },
    description: { type: String, default: null },
    ctaUrl:      { type: String, default: null },
    isPopular:   { type: Boolean, default: false },
    features:    [{ type: String }],
    sortOrder:   { type: Number, default: 0 },
  },
  { _id: false }
);

const aiToolSchema = new mongoose.Schema(
  {
    name:             { type: String, required: true, trim: true },
    slug:             { type: String, required: true, unique: true, lowercase: true },
    description:      { type: String, required: true },
    shortDescription: { type: String, maxlength: 200 },
    url:              { type: String, required: true },
    logo:             { type: String, default: null },
    coverImage:       { type: String, default: null },
    screenshots:      [{ type: String }],
    categories:       [{ type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }],
    tags:             [{ type: String, trim: true }],
    pricing: {
      type:    String,
      enum:    ["free", "freemium", "paid", "open-source", "contact"],
      default: "free",
    },
    pricingDetails: { type: String, default: null },
    companyName:    { type: String, default: null },
    developerName:  { type: String, default: null },
    foundedYear:    { type: Number, default: null, min: 1950, max: 2100 },
    headquarters:   { type: String, default: null },
    supportEmail:   { type: String, default: null },
    docsUrl:        { type: String, default: null },
    socialMedia: {
      website:  { type: String, default: null },
      x:        { type: String, default: null },
      linkedin: { type: String, default: null },
      youtube:  { type: String, default: null },
    },
    apiAvailable:   { type: Boolean, default: false },
    hasFreeTrial:   { type: Boolean, default: false },
    freeTrialDays:  { type: Number, default: null, min: 0, max: 365 },
    tutorials:      [tutorialSchema],
    pricingPlans:   [pricingPlanSchema],
    features:       [{ type: String }],
    useCases:       [{ type: String }],
    prompts:        [{ type: mongoose.Schema.Types.ObjectId, ref: "Prompt" }],
    promptTips:     [{ type: String }],
    pros:           [{ type: String }],
    cons:           [{ type: String }],
    faqs: [
      {
        question: { type: String, trim: true },
        answer:   { type: String, trim: true },
      },
    ],
    status: {
      type:    String,
      enum:    ["draft", "published", "archived"],
      default: "draft",
    },
    publishedAt:   { type: Date, default: null },
    isFeatured:    { type: Boolean, default: false },
    isVerified:    { type: Boolean, default: false },
    viewCount:     { type: Number,  default: 0 },
    likeCount:     { type: Number,  default: 0 },
    averageRating: { type: Number,  default: 0, min: 0, max: 5 },
    reviewCount:   { type: Number,  default: 0 },
    moderation: {
      reportCount: { type: Number, default: 0 },
      isFlagged: { type: Boolean, default: false },
      lastReportedAt: { type: Date, default: null },
    },
    addedBy:       { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    meta: {
      title:       String,
      description: String,
      keywords:    [String],
    },
  },
  { timestamps: true }
);

aiToolSchema.index({ name: "text", description: "text", shortDescription: "text" });
aiToolSchema.index({ categories: 1, status: 1 });
aiToolSchema.index({ isFeatured: 1, status: 1 });

export default mongoose.model("AITool", aiToolSchema);