import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    name:                 { type: String, required: true, trim: true },
    email:                { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:             { type: String, required: true, select: false },
    role:                 { type: String, enum: ["admin", "superadmin"], default: "admin" },
    avatar:               { type: String, default: null },
    isActive:             { type: Boolean, default: true },
    twoFactorSecret:      { type: String, select: false },
    twoFactorEnabled:     { type: Boolean, default: false },
    twoFactorVerified:    { type: Boolean, default: false },
    passwordResetToken:   { type: String, select: false },
    passwordResetExpires: { type: Date,   select: false },
    lastLogin:            { type: Date,   default: null },
    createdBy:            { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    permissions: {
      manageUsers:    { type: Boolean, default: true },
      manageAITools:  { type: Boolean, default: true },
      manageBlogs:    { type: Boolean, default: true },
      manageCourses:  { type: Boolean, default: true },
      managePrompts:  { type: Boolean, default: true },
      manageEmail:    { type: Boolean, default: true },
      manageNotifications: { type: Boolean, default: true },
      manageModeration: { type: Boolean, default: true },
      manageAdmins:   { type: Boolean, default: false },
      manageSettings: { type: Boolean, default: false },
      viewAnalytics:  { type: Boolean, default: true },
      viewAuditLogs:  { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

adminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.twoFactorSecret;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

export default mongoose.model("Admin", adminSchema);