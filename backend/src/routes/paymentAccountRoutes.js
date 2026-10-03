import express from "express";
import {
  getPaymentAccounts,
  createPaymentAccount,
  updatePaymentAccount,
  deletePaymentAccount,
} from "../controllers/paymentAccountController.js";
import { protect, authorize, identify } from "../middleware/auth.js";

const router = express.Router();

router.get("/", identify, getPaymentAccounts);
router.post("/", protect, authorize("admin"), createPaymentAccount);
router.put("/:id", protect, authorize("admin"), updatePaymentAccount);
router.delete("/:id", protect, authorize("admin"), deletePaymentAccount);

export default router;
