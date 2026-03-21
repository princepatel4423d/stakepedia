const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const ADMIN_URL = process.env.ADMIN_URL || "http://localhost:5174";

const baseStyles = "font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;line-height:1.5;color:#111827";

const defaultEmailTemplates = {
  welcome: {
    name: "Welcome Email",
    slug: "welcome",
    subject: "Welcome to Stakepedia, {{name}}!",
    htmlBody: `<!DOCTYPE html><html><body style="${baseStyles}"><h1 style="color:#1d4ed8">Welcome to Stakepedia</h1><p>Hi {{name}},</p><p>Thanks for joining Stakepedia. Explore AI tools, prompts, blogs, and courses from one place.</p><p><a href="{{loginUrl}}" style="display:inline-block;padding:12px 18px;background:#1d4ed8;color:#ffffff;text-decoration:none;border-radius:6px">Sign in</a></p><p style="font-size:12px;color:#6b7280">If the button does not work, use this link: {{loginUrl}}</p></body></html>`,
    variables: ["name", "loginUrl"],
  },
  "verify-email": {
    name: "Verify Email",
    slug: "verify-email",
    subject: "Verify your Stakepedia email",
    htmlBody: `<!DOCTYPE html><html><body style="${baseStyles}"><h1 style="color:#1d4ed8">Verify your email</h1><p>Hi {{name}},</p><p>Please verify your email to activate your account.</p><p><a href="{{verifyUrl}}" style="display:inline-block;padding:12px 18px;background:#1d4ed8;color:#ffffff;text-decoration:none;border-radius:6px">Verify email</a></p><p style="font-size:12px;color:#6b7280">If you did not create this account, ignore this email.</p></body></html>`,
    variables: ["name", "verifyUrl"],
  },
  "verify-email-otp": {
    name: "Verify Email OTP",
    slug: "verify-email-otp",
    subject: "Your Stakepedia email verification code",
    htmlBody: `<!DOCTYPE html><html><body style="${baseStyles}"><h1 style="color:#1d4ed8">Email verification code</h1><p>Hi {{name}},</p><p>Use this one-time code to verify your email:</p><p style="font-size:28px;font-weight:700;letter-spacing:4px">{{otp}}</p><p>This code expires in {{expiresIn}}.</p></body></html>`,
    variables: ["name", "otp", "expiresIn"],
  },
  "reset-password": {
    name: "Reset Password",
    slug: "reset-password",
    subject: "Reset your Stakepedia password",
    htmlBody: `<!DOCTYPE html><html><body style="${baseStyles}"><h1 style="color:#dc2626">Reset your password</h1><p>Hi {{name}},</p><p>We received a request to reset your password.</p><p><a href="{{resetUrl}}" style="display:inline-block;padding:12px 18px;background:#dc2626;color:#ffffff;text-decoration:none;border-radius:6px">Reset password</a></p><p style="font-size:12px;color:#6b7280">This link expires in {{expiresIn}}.</p></body></html>`,
    variables: ["name", "resetUrl", "expiresIn"],
  },
  "reset-password-otp": {
    name: "Reset Password OTP",
    slug: "reset-password-otp",
    subject: "Your Stakepedia password reset code",
    htmlBody: `<!DOCTYPE html><html><body style="${baseStyles}"><h1 style="color:#dc2626">Password reset code</h1><p>Hi {{name}},</p><p>Use this one-time code to reset your password:</p><p style="font-size:28px;font-weight:700;letter-spacing:4px">{{otp}}</p><p>This code expires in {{expiresIn}}.</p></body></html>`,
    variables: ["name", "otp", "expiresIn"],
  },
  "admin-reset-password": {
    name: "Admin Reset Password",
    slug: "admin-reset-password",
    subject: "Reset your admin password",
    htmlBody: `<!DOCTYPE html><html><body style="${baseStyles}"><h1 style="color:#dc2626">Reset your admin password</h1><p>Hi {{name}},</p><p>Use the link below to reset your admin password.</p><p><a href="{{resetUrl}}" style="display:inline-block;padding:12px 18px;background:#dc2626;color:#ffffff;text-decoration:none;border-radius:6px">Reset admin password</a></p><p style="font-size:12px;color:#6b7280">This link expires in {{expiresIn}}.</p></body></html>`,
    variables: ["name", "resetUrl", "expiresIn"],
  },
};

export const getDefaultEmailTemplate = (slug) => {
  if (!slug) return null;
  return defaultEmailTemplates[slug] || null;
};

export const getDefaultTemplateVariables = () => ({
  loginUrl: `${CLIENT_URL}/login`,
  verifyUrl: `${CLIENT_URL}/verify-email`,
  resetUrl: `${CLIENT_URL}/reset-password`,
  adminResetUrl: `${ADMIN_URL}/reset-password`,
});

export default defaultEmailTemplates;