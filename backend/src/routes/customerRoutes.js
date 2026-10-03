import express from "express";
import { getCustomers, getCustomerById } from "../controllers/customerController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/", getCustomers);
router.get("/:id", getCustomerById);

export default router;
