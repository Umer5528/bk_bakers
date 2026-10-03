import express from "express";
import {
  getBlockedDates,
  blockDate,
  unblockDate,
} from "../controllers/blockedDateController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/", getBlockedDates);
router.post("/", blockDate);
router.delete("/:id", unblockDate);

export default router;
