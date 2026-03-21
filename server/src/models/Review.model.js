import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetType:   { type: String, enum: ["AITool", "Course", "Blog", "Prompt"], required: true },
    targetId:     { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "targetType" },
    rating:       { type: Number, min: 1, max: 5, required: true },
    title:        { type: String, trim: true },
    content:      { type: String, required: true },
    isApproved:   { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0 },
    reportCount:  { type: Number, default: 0 },
    isFlagged:    { type: Boolean, default: false },
    flagReason:   { type: String, default: null },
  },
  { timestamps: true }
);

reviewSchema.index({ targetType: 1, targetId: 1, isApproved: 1 });
reviewSchema.index({ user: 1, targetId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);