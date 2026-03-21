import express from "express";
import { protectAdmin, requirePermission } from "../middleware/auth.middleware.js";
import {
  getAllTemplates, getTemplateById, createTemplate,
  updateTemplate, deleteTemplate, previewTemplate, sendTestEmail,
  sendCampaign, getEmailLogs, getEmailStats, getCampaignRecipients,
} from "../controllers/adminEmail.controller.js";

const router = express.Router();
router.use(protectAdmin, requirePermission("manageEmail"));

router.get   ("/templates",               getAllTemplates);
router.post  ("/templates",               createTemplate);
router.get   ("/templates/:id",           getTemplateById);
router.put   ("/templates/:id",           updateTemplate);
router.delete("/templates/:id",           deleteTemplate);
router.get   ("/templates/:id/preview",   previewTemplate);
router.post  ("/templates/:id/send-test", sendTestEmail);
router.get   ("/campaigns/recipients",    getCampaignRecipients);
router.post  ("/campaigns/send",          sendCampaign);
router.get   ("/logs",                    getEmailLogs);
router.get   ("/stats",                   getEmailStats);

export default router;