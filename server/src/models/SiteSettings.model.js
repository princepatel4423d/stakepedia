import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName:        { type: String, default: "Stakepedia" },
    siteDescription: { type: String, default: "Discover the best AI tools" },
    siteLogo:        { type: String, default: null },
    favicon:         { type: String, default: null },
    primaryColor:    { type: String, default: "#6366f1" },
    secondaryColor:  { type: String, default: "#8b5cf6" },
    accentColor:     { type: String, default: "#06b6d4" },
    theme:           { type: String, enum: ["light", "dark", "system"], default: "system" },
    fontFamily:      { type: String, default: "Inter" },
    socialLinks: {
      twitter:  { type: String, default: null },
      github:   { type: String, default: null },
      linkedin: { type: String, default: null },
      discord:  { type: String, default: null },
      youtube:  { type: String, default: null },
    },
    seo: {
      metaTitle:       { type: String, default: "Stakepedia — Discover AI Tools" },
      metaDescription: { type: String, default: "Discover and explore the best AI tools, courses, and prompts." },
      keywords:        [{ type: String }],
      ogImage:         { type: String, default: null },
    },
    maintenanceMode:     { type: Boolean, default: false },
    allowRegistrations:  { type: Boolean, default: true },
    emailNotifications:  { type: Boolean, default: true },
    googleAnalyticsId:   { type: String, default: null },
    customHeaderScripts: { type: String, default: null },
    customFooterScripts: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("SiteSettings", siteSettingsSchema);