import express from "express";
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, authorize, identify } from "../middleware/auth.js";
import { uploadImages } from "../middleware/upload.js";

const router = express.Router();

router.get("/", identify, getCategories);
router.get("/:slug", identify, getCategoryBySlug);

router.post(
  "/",
  protect,
  authorize("admin"),
  uploadImages.single("image"),
  createCategory
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  uploadImages.single("image"),
  updateCategory
);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

export default router;
