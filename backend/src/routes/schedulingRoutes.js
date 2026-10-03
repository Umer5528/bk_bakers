import express from "express";
import { getProductAvailability } from "../controllers/schedulingController.js";

const router = express.Router();

router.get("/availability", getProductAvailability);

export default router;
