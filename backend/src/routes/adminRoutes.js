import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/adminMiddleware.js";
import {
  listUsers,
  listBlogs,
  deleteBlog,
  analytics,
  trending,
  suspendUser,
  deleteUser,
  approveBlog,
  updateUserRole,
} from "../controllers/adminController.js";
import { getAnalytics } from "../controllers/analyticsController.js";
import { validate } from "../middlewares/validate.js";
import {
  validateListUsers,
  validateSuspendUser,
  validateDeleteUser,
  validateUpdateUserRole,
  validateListBlogs,
  validateApproveBlog,
  validateDeleteBlog,
  // validateAdminAnalytics, // removed as getAnalytics might not need validation if it's just GET
} from "../validations/adminValidation.js";

const router = express.Router();

// 7.1 User Management
router.get(
  "/users",
  authMiddleware,
  adminOnly,
  validateListUsers,
  validate,
  listUsers
);
router.patch(
  "/users/:id/suspend",
  authMiddleware,
  adminOnly,
  validateSuspendUser,
  validate,
  suspendUser
);
router.delete(
  "/users/:id",
  authMiddleware,
  adminOnly,
  validateDeleteUser,
  validate,
  deleteUser
);
router.patch(
  "/users/:id/role",
  authMiddleware,
  adminOnly,
  validateUpdateUserRole,
  validate,
  updateUserRole
);

// 7.2 Blog Moderation
router.get(
  "/blogs",
  authMiddleware,
  adminOnly,
  validateListBlogs,
  validate,
  listBlogs
);
router.delete(
  "/blogs/:id",
  authMiddleware,
  adminOnly,
  validateDeleteBlog,
  validate,
  deleteBlog
);
router.patch(
  "/blogs/:id/approve",
  authMiddleware,
  adminOnly,
  validateApproveBlog,
  validate,
  approveBlog
);

// 7.3 Platform-Level Analytics
router.get("/analytics", authMiddleware, adminOnly, getAnalytics);

// 7.4 Trending topics
router.get("/trending", authMiddleware, adminOnly, trending);

export default router;
