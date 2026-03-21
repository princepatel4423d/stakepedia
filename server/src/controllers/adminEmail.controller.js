import EmailTemplate from "../models/EmailTemplate.model.js";
import EmailLog      from "../models/EmailLog.model.js";
import User          from "../models/User.model.js";
import Admin         from "../models/Admin.model.js";
import { sendEmail } from "../services/email.service.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/apiResponse.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.utils.js";
import { createAuditLog } from "../middleware/audit.middleware.js";
import { getDefaultTemplateVariables } from "../templates/defaultEmailTemplates.js";

const getIP = (req) => req.ip || req.headers["x-forwarded-for"] || "unknown";
const ADMIN_TEMPLATE_CATEGORIES = ["marketing", "notification"];

const dedupeEmails = (emails = []) => [...new Set(emails.filter(Boolean).map((e) => e.trim().toLowerCase()))];

const extractHandlebarsVariables = (input = "") => {
  const regex = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;
  const found = new Set();
  let match;
  while ((match = regex.exec(input)) !== null) {
    found.add(match[1]);
  }
  return [...found];
};

const normalizeMalformedUrlPlaceholders = (input = "") => {
  if (!input) return "";

  // Case 1: {{https://example.com}} -> https://example.com
  let normalized = input.replace(
    /\{\{\s*((?:https?:\/\/|mailto:)[^\s}]+)\s*\}\}/gi,
    "$1"
  );

  // Case 2: {{https://example.com   (missing closing braces)
  normalized = normalized.replace(
    /\{\{\s*((?:https?:\/\/|mailto:)[^\s"'>]+)/gi,
    "$1"
  );

  return normalized;
};

const resolveCampaignRecipients = async ({ audience, recipients = [], userIds = [], adminIds = [] }) => {
  if (!audience) {
    if (recipients.length === 1 && recipients[0] === "ALL_USERS") {
      const users = await User.find({ isEmailVerified: true, isActive: true }).select("email").lean();
      return { recipientEmails: dedupeEmails(users.map((u) => u.email)), audience: "all_users" };
    }
    return { recipientEmails: dedupeEmails(recipients), audience: "custom_emails" };
  }

  switch (audience) {
    case "all_users": {
      const users = await User.find({ isEmailVerified: true, isActive: true }).select("email").lean();
      return { recipientEmails: dedupeEmails(users.map((u) => u.email)), audience };
    }
    case "selected_users": {
      const users = await User.find({ _id: { $in: userIds }, isEmailVerified: true, isActive: true }).select("email").lean();
      return { recipientEmails: dedupeEmails(users.map((u) => u.email)), audience };
    }
    case "all_admins": {
      const admins = await Admin.find({ isActive: true }).select("email").lean();
      return { recipientEmails: dedupeEmails(admins.map((a) => a.email)), audience };
    }
    case "selected_admins": {
      const admins = await Admin.find({ _id: { $in: adminIds }, isActive: true }).select("email").lean();
      return { recipientEmails: dedupeEmails(admins.map((a) => a.email)), audience };
    }
    case "custom_emails":
      return { recipientEmails: dedupeEmails(recipients), audience };
    default:
      return { recipientEmails: [], audience };
  }
};

// ── Templates ────────────────────────────────────────────────────────────────

export const getAllTemplates = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isSystem: { $ne: true } };
    if (category) query.category = category;
    const templates = await EmailTemplate.find(query)
      .populate("createdBy", "name email")
      .sort("-createdAt");
    return successResponse(res, "Templates fetched.", templates);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getTemplateById = async (req, res) => {
  try {
    const tmpl = await EmailTemplate.findOne({ _id: req.params.id, isSystem: { $ne: true } })
      .populate("createdBy", "name email");
    if (!tmpl) return errorResponse(res, "Template not found.", 404);
    return successResponse(res, "Template fetched.", tmpl);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const createTemplate = async (req, res) => {
  try {
    const { slug: _ignoredSlug, ...payloadBody } = req.body;
    const payload = {
      ...payloadBody,
      category: payloadBody.category || "marketing",
      isSystem: false,
      createdBy: req.admin._id,
    };

    if (!ADMIN_TEMPLATE_CATEGORIES.includes(payload.category)) {
      return errorResponse(res, "Only marketing or notification templates can be managed from admin.", 400);
    }

    const tmpl = await EmailTemplate.create(payload);

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "email.template.created",
      resource:     "EmailTemplate",
      resourceId:   tmpl._id,
      resourceName: tmpl.slug,
      newData:      { name: tmpl.name, slug: tmpl.slug, category: tmpl.category },
      ip:           getIP(req),
    });

    return successResponse(res, "Template created.", tmpl, 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const tmpl = await EmailTemplate.findOne({ _id: req.params.id, isSystem: { $ne: true } });
    if (!tmpl) return errorResponse(res, "Template not found.", 404);

    const { slug: _ignoredSlug, ...updateData } = req.body;

    if (updateData.category && !ADMIN_TEMPLATE_CATEGORIES.includes(updateData.category)) {
      return errorResponse(res, "Only marketing or notification templates can be managed from admin.", 400);
    }

    const oldData = { name: tmpl.name, subject: tmpl.subject };
    Object.assign(tmpl, updateData);
    tmpl.isSystem = false;
    await tmpl.save();

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "email.template.updated",
      resource:     "EmailTemplate",
      resourceId:   tmpl._id,
      resourceName: tmpl.slug,
      oldData,
      newData:      updateData,
      ip:           getIP(req),
    });

    return successResponse(res, "Template updated.", tmpl);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const tmpl = await EmailTemplate.findOne({ _id: req.params.id, isSystem: { $ne: true } });
    if (!tmpl) return errorResponse(res, "Template not found.", 404);

    await tmpl.deleteOne();

    await createAuditLog({
      adminId:      req.admin._id,
      action:       "email.template.deleted",
      resource:     "EmailTemplate",
      resourceId:   tmpl._id,
      resourceName: tmpl.slug,
      ip:           getIP(req),
    });

    return successResponse(res, "Template deleted.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const previewTemplate = async (req, res) => {
  try {
    const tmpl = await EmailTemplate.findOne({ _id: req.params.id, isSystem: { $ne: true } });
    if (!tmpl) return errorResponse(res, "Template not found.", 404);

    const sampleVars = { ...getDefaultTemplateVariables() };

    const templateVariables = Array.isArray(tmpl.variables) ? tmpl.variables : [];
    templateVariables.forEach((v) => {
      if (typeof v === "string") {
        sampleVars[v] = sampleVars[v] || `Sample ${v}`;
        return;
      }

      if (v?.name) {
        sampleVars[v.name] = v.defaultValue || sampleVars[v.name] || `Sample ${v.name}`;
      }
    });

    const detectedVars = [
      ...extractHandlebarsVariables(tmpl.subject || ""),
      ...extractHandlebarsVariables(tmpl.htmlBody || ""),
    ];

    detectedVars.forEach((key) => {
      if (sampleVars[key] === undefined) {
        sampleVars[key] = `Sample ${key}`;
      }
    });

    const Handlebars  = (await import("handlebars")).default;
    let renderedHtml;
    let renderedSubject;
    const safeHtmlBody = normalizeMalformedUrlPlaceholders(tmpl.htmlBody || "");
    const safeSubject = normalizeMalformedUrlPlaceholders(tmpl.subject || "");

    try {
      renderedHtml = Handlebars.compile(safeHtmlBody)(sampleVars);
      renderedSubject = Handlebars.compile(safeSubject)(sampleVars);
    } catch (compileErr) {
      return errorResponse(
        res,
        `Template syntax error: ${compileErr.message}`,
        400
      );
    }

    return successResponse(res, "Template preview.", {
      subject: renderedSubject,
      html: renderedHtml,
      variables: detectedVars,
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const sendTestEmail = async (req, res) => {
  try {
    const { to, variables } = req.body;
    const tmpl = await EmailTemplate.findOne({ _id: req.params.id, isSystem: { $ne: true } });
    if (!tmpl) return errorResponse(res, "Template not found.", 404);

    const result = await sendEmail({
      to,
      subject:   tmpl.subject,
      template:  tmpl.slug,
      variables: variables || {},
      sentBy:    req.admin._id,
    });

    if (!result.success) return errorResponse(res, `Failed to send: ${result.error}`, 500);
    return successResponse(res, `Test email sent to ${to}.`);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ── Campaigns ────────────────────────────────────────────────────────────────

export const getCampaignRecipients = async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const searchRegex = search ? new RegExp(search, "i") : null;

    const [users, admins, userCount, adminCount] = await Promise.all([
      User.find({
        isActive: true,
        isEmailVerified: true,
        ...(searchRegex && { $or: [{ name: searchRegex }, { email: searchRegex }] }),
      }).select("name email").sort("name").limit(100).lean(),
      Admin.find({
        isActive: true,
        ...(searchRegex && { $or: [{ name: searchRegex }, { email: searchRegex }] }),
      }).select("name email role").sort("name").limit(100).lean(),
      User.countDocuments({ isActive: true, isEmailVerified: true }),
      Admin.countDocuments({ isActive: true }),
    ]);

    return successResponse(res, "Campaign recipients fetched.", {
      users,
      admins,
      counts: {
        users: userCount,
        admins: adminCount,
      },
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const sendCampaign = async (req, res) => {
  try {
    const {
      recipients,
      audience,
      userIds,
      adminIds,
      templateId,
      subject,
      html,
      variables,
      campaignId,
    } = req.body;

    const { recipientEmails, audience: resolvedAudience } = await resolveCampaignRecipients({
      audience,
      recipients,
      userIds,
      adminIds,
    });

    if (!recipientEmails.length)
      return errorResponse(res, "No recipients found for selected audience.", 400);

    let templateSlug = null;
    if (templateId) {
      const tmpl = await EmailTemplate.findOne({ _id: templateId, isSystem: { $ne: true } });
      if (!tmpl) return errorResponse(res, "Template not found.", 404);
      if (!ADMIN_TEMPLATE_CATEGORIES.includes(tmpl.category)) {
        return errorResponse(res, "Only marketing or notification templates can be used in campaigns.", 400);
      }
      templateSlug = tmpl.slug;
    }

    if (!templateSlug && (!subject || !html)) {
      return errorResponse(res, "Subject and HTML body are required for custom email campaigns.", 400);
    }

    const finalCampaignId = campaignId || `campaign_${Date.now()}`;

    const results = await Promise.allSettled(
      recipientEmails.map((to) =>
        sendEmail({
          to,
          subject,
          html,
          template:   templateSlug,
          variables:  variables || {},
          sentBy:     req.admin._id,
          isBulk:     true,
          campaignId: finalCampaignId,
        })
      )
    );

    const sent   = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
    const failed = results.length - sent;

    await createAuditLog({
      adminId:  req.admin._id,
      action:   "email.campaign.sent",
      resource: "EmailCampaign",
      newData:  {
        audience: resolvedAudience,
        total: recipientEmails.length,
        sent,
        failed,
        templateSlug,
        campaignId: finalCampaignId,
      },
      ip:       getIP(req),
    });

    return successResponse(res, `Campaign complete. ${sent} sent, ${failed} failed.`, {
      audience: resolvedAudience,
      sent,
      failed,
      total: recipientEmails.length,
      campaignId: finalCampaignId,
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ── Logs ─────────────────────────────────────────────────────────────────────

export const getEmailLogs = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, isBulk, to, template, campaignId, q } = req.query;
    const query = {};
    if (status) query.status = status;
    if (isBulk !== undefined) query.isBulk = isBulk === "true";
    if (to) query.to = new RegExp(to, "i");
    if (template) query.template = template;
    if (campaignId) query.campaignId = new RegExp(campaignId, "i");

    if (q) {
      const regex = new RegExp(q, "i");
      query.$or = [
        { to: regex },
        { subject: regex },
        { template: regex },
        { error: regex },
        { campaignId: regex },
      ];
    }

    const [logs, total] = await Promise.all([
      EmailLog.find(query)
        .populate("sentBy", "name email")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit)
        .lean(),
      EmailLog.countDocuments(query),
    ]);

    return paginatedResponse(res, "Email logs fetched.", logs, buildPaginationMeta(total, page, limit));
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getEmailStats = async (req, res) => {
  try {
    const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [total, sent, failed, bulk, transactional] = await Promise.all([
      EmailLog.countDocuments({ createdAt: { $gte: last30 } }),
      EmailLog.countDocuments({ status: "sent",   createdAt: { $gte: last30 } }),
      EmailLog.countDocuments({ status: "failed", createdAt: { $gte: last30 } }),
      EmailLog.countDocuments({ isBulk: true,     createdAt: { $gte: last30 } }),
      EmailLog.countDocuments({ isBulk: false,    createdAt: { $gte: last30 } }),
    ]);

    return successResponse(res, "Email stats fetched.", {
      last30Days: { total, sent, failed, bulk, transactional },
      deliveryRate: total > 0 ? ((sent / total) * 100).toFixed(1) + "%" : "0%",
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};