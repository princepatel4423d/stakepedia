import Handlebars from "handlebars";
import { transporter } from "../config/mailer.config.js";
import EmailTemplate from "../models/EmailTemplate.model.js";
import EmailLog from "../models/EmailLog.model.js";
import { getDefaultEmailTemplate, getDefaultTemplateVariables } from "../templates/defaultEmailTemplates.js";

const normalizeMalformedUrlPlaceholders = (input = "") => {
  if (!input) return "";

  let normalized = input.replace(
    /\{\{\s*((?:https?:\/\/|mailto:)[^\s}]+)\s*\}\}/gi,
    "$1"
  );

  normalized = normalized.replace(
    /\{\{\s*((?:https?:\/\/|mailto:)[^\s"'>]+)/gi,
    "$1"
  );

  return normalized;
};

export const sendEmail = async ({ to, subject, html, template, variables = {}, sentBy = null, isBulk = false, campaignId = null }) => {
  const log = await EmailLog.create({ to, subject, template: template || null, sentBy, isBulk, campaignId });
  try {
    let finalSubject = subject;
    let finalHtml = html;

    if (template) {
      const customTemplate = await EmailTemplate.findOne({ slug: template, isActive: true, isSystem: { $ne: true } })
        .select("subject htmlBody")
        .lean();
      const fallbackTemplate = getDefaultEmailTemplate(template);
      const resolvedTemplate = customTemplate || fallbackTemplate;

      if (resolvedTemplate) {
        const mergedVars = { ...getDefaultTemplateVariables(), ...variables };
        const safeSubject = normalizeMalformedUrlPlaceholders(resolvedTemplate.subject || "");
        const safeHtmlBody = normalizeMalformedUrlPlaceholders(resolvedTemplate.htmlBody || "");
        finalSubject = Handlebars.compile(safeSubject)(mergedVars);
        finalHtml = Handlebars.compile(safeHtmlBody)(mergedVars);
      }
    }

    await transporter.sendMail({ from: process.env.MAIL_FROM, to, subject: finalSubject, html: finalHtml });
    log.status = "sent";
    log.sentAt = new Date();
    await log.save();
    return { success: true };
  } catch (error) {
    log.status = "failed";
    log.error = error.message;
    await log.save();
    console.error("Email send error:", error.message);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = (user) => sendEmail({ to: user.email, subject: "Welcome to Stakepedia!", template: "welcome", variables: { name: user.name, loginUrl: `${process.env.CLIENT_URL}/login` } });
export const sendVerificationEmail = (user, otp) => sendEmail({ to: user.email, subject: "Verify your email", template: "verify-email-otp", variables: { name: user.name, otp, expiresIn: "10 minutes" } });
export const sendPasswordResetEmail = (user, token) => sendEmail({ to: user.email, subject: "Reset your password", template: "reset-password", variables: { name: user.name, resetUrl: `${process.env.CLIENT_URL}/reset-password?token=${token}`, expiresIn: "1 hour" } });
export const sendAdminResetEmail = (admin, token) => sendEmail({ to: admin.email, subject: "Reset admin password", template: "admin-reset-password", variables: { name: admin.name, resetUrl: `${process.env.ADMIN_URL}/reset-password?token=${token}`, expiresIn: "1 hour" } });