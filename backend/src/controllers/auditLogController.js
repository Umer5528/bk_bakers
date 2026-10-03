import asyncHandler from "express-async-handler";
import AuditLog from "../models/AuditLog.js";

// @desc    List recent admin actions
// @route   GET /api/v1/audit-logs
// @access  Private/Admin
export const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find()
    .populate("admin", "name role")
    .sort({ createdAt: -1 })
    .limit(100);
  res.status(200).json({ success: true, count: logs.length, logs });
});
