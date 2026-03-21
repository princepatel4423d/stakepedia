import express from "express";
import { protectAdmin, requirePermission } from "../middleware/auth.middleware.js";
import {
  getAllUsers, getUserById,
  toggleUserStatus, setUserBan, deleteUser, getUserStats,
} from "../controllers/adminUser.controller.js";

const router = express.Router();
router.use(protectAdmin, requirePermission("manageUsers"));

router.get   ("/stats",      getUserStats);
router.get   ("/",           getAllUsers);
router.get   ("/:id",        getUserById);
router.patch ("/:id/status", toggleUserStatus);
router.patch ("/:id/ban",    setUserBan);
router.delete("/:id",        deleteUser);

export default router;