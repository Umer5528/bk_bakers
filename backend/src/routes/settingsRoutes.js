import express from "express";
import { getSettings, updateSettings } from "../controllers/businessSettingsController.js";
import { protect, authorize } from "../middleware/auth.js";
import { uploadImages } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getSettings);
router.put("/", protect, authorize("admin"), uploadImages.single("logo"), updateSettings);

export default router;
