import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name:                 { type: String, required: true, trim: true },
    email:                { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:             { type: String, select: false },
    avatar:               { type: String, default: null },
    role:                 { type: String, enum: ["user", "admin", "superadmin"], default: "user" },
    authProvider:         { type: String, enum: ["local", "google"], default: "local" },
    googleId:             { type: String, default: null },
    isEmailVerified:      { type: Boolean, default: false },
    isActive:             { type: Boolean, default: true },
    banStatus:            { type: String, enum: ["none", "temporary", "permanent"], default: "none" },
    banReason:            { type: String, default: null },
    bannedAt:             { type: Date, default: null },
    bannedUntil:          { type: Date, default: null },
    bannedBy:             { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    emailVerifyToken:     { type: String, select: false },
    emailVerifyExpires:   { type: Date,   select: false },
    passwordResetToken:   { type: String, select: false },
    passwordResetExpires: { type: Date,   select: false },
    lastLogin:            { type: Date,   default: null },
    likedTools:           [{ type: mongoose.Schema.Types.ObjectId, ref: "AITool" }],
    likedBlogs:           [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
    likedPrompts:         [{ type: mongoose.Schema.Types.ObjectId, ref: "Prompt" }],
    savedTools:           [{ type: mongoose.Schema.Types.ObjectId, ref: "AITool" }],
    bio:                  { type: String, default: null, maxlength: 300 },
    website:              { type: String, default: null },
    social: {
      twitter:  { type: String, default: null },
      github:   { type: String, default: null },
      linkedin: { type: String, default: null },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerifyToken;
  delete obj.emailVerifyExpires;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

export default mongoose.model("User", userSchema);