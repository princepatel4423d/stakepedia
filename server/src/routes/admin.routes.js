import express from "express";
import { protectAdmin, requirePermission } from "../middleware/auth.middleware.js";
import {
  getAllAdmins, createAdmin, getAdminById,
  updateAdmin, updateAdminPermissions, deleteAdmin,
} from "../controllers/adminManage.controller.js";

const router = express.Router();
router.use(protectAdmin, requirePermission("manageAdmins"));

router.get   ("/",                getAllAdmins);
router.post  ("/",                createAdmin);
router.get   ("/:id",             getAdminById);
router.put   ("/:id",             updateAdmin);
router.patch ("/:id/permissions", updateAdminPermissions);
router.delete("/:id",             deleteAdmin);

export default router;