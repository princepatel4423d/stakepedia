import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
  {
    to:         { type: String, required: true },
    subject:    { type: String, required: true },
    template:   { type: String, default: null },
    sentBy:     { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    status:     { type: String, enum: ["sent", "failed", "pending"], default: "pending" },
    error:      { type: String, default: null },
    sentAt:     { type: Date, default: null },
    isBulk:     { type: Boolean, default: false },
    campaignId: { type: String, default: null },
  },
  { timestamps: true }
);

emailLogSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("EmailLog", emailLogSchema);