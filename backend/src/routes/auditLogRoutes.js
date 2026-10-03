import express from "express";
import { getAuditLogs } from "../controllers/auditLogController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, authorize("admin"), getAuditLogs);

export default router;
