import express from "express";
import {
  registerCustomer,
  registerAdmin,
  registerSuperAdmin,
  login,
  logout,
  getMe,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", authLimiter, registerCustomer);
router.post("/admin/register", authLimiter, registerAdmin);
router.post("/superadmin/register", authLimiter, registerSuperAdmin);
router.post("/login", authLimiter, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.put("/reset-password/:token", authLimiter, resetPassword);

router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.put("/change-password", protect, changePassword);

export default router;
