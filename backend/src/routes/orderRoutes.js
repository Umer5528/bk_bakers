import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderByNumber,
  getAllOrders,
  verifyPayment,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/auth.js";
import { uploadImages } from "../middleware/upload.js";

const router = express.Router();

router.post("/", protect, uploadImages.single("receipt"), createOrder);
router.get("/mine", protect, getMyOrders);
router.get("/", protect, authorize("admin"), getAllOrders);
router.get("/:orderNumber", protect, getOrderByNumber);

router.put("/:id/verify-payment", protect, authorize("admin"), verifyPayment);
router.put("/:id/status", protect, authorize("admin"), updateOrderStatus);
router.put("/:id/cancel", protect, cancelOrder);

export default router;
