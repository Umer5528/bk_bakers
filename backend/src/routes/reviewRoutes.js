import express from "express";
import {
  createReview,
  getProductReviews,
  getAllReviews,
  moderateReview,
} from "../controllers/reviewController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getProductReviews);
router.get("/admin", protect, authorize("admin"), getAllReviews);
router.post("/", protect, createReview);
router.put("/:id/moderate", protect, authorize("admin"), moderateReview);

export default router;
