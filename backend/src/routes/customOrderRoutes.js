import express from "express";
import {
  createCustomOrder,
  getMyCustomOrders,
  getAllCustomOrders,
  quoteCustomOrder,
  respondToQuote,
  rejectCustomOrder,
} from "../controllers/customOrderController.js";
import { protect, authorize } from "../middleware/auth.js";
import { uploadImages } from "../middleware/upload.js";

const router = express.Router();

router.post("/", protect, uploadImages.single("referenceImage"), createCustomOrder);
router.get("/mine", protect, getMyCustomOrders);
router.get("/", protect, authorize("admin"), getAllCustomOrders);
router.put("/:id/quote", protect, authorize("admin"), quoteCustomOrder);
router.put("/:id/reject", protect, authorize("admin"), rejectCustomOrder);
router.put("/:id/respond", protect, respondToQuote);

export default router;
