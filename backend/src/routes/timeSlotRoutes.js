import express from "express";
import {
  getTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
} from "../controllers/timeSlotController.js";
import { protect, authorize, identify } from "../middleware/auth.js";

const router = express.Router();

router.get("/", identify, getTimeSlots);
router.post("/", protect, authorize("admin"), createTimeSlot);
router.put("/:id", protect, authorize("admin"), updateTimeSlot);
router.delete("/:id", protect, authorize("admin"), deleteTimeSlot);

export default router;
