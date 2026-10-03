import express from "express";
import {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from "../controllers/galleryController.js";
import { protect, authorize } from "../middleware/auth.js";
import { uploadImages } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getGalleryItems);
router.post("/", protect, authorize("admin"), uploadImages.single("image"), createGalleryItem);
router.put("/:id", protect, authorize("admin"), updateGalleryItem);
router.delete("/:id", protect, authorize("admin"), deleteGalleryItem);

export default router;
