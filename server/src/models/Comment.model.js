import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    blog:          { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
    content:       { type: String, required: true, trim: true },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
    isApproved:    { type: Boolean, default: true },
    likeCount:     { type: Number, default: 0 },
    reportCount:   { type: Number, default: 0 },
    isFlagged:     { type: Boolean, default: false },
    flagReason:    { type: String, default: null },
  },
  { timestamps: true }
);

commentSchema.index({ blog: 1, isApproved: 1 });

export default mongoose.model("Comment", commentSchema);