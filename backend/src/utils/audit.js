import AuditLog from "../models/AuditLog.js";

// Fire-and-forget audit logging — never let a logging failure break the
// actual admin action it's describing.
export const logAdminAction = async (adminId, action, targetType = "", targetId = null) => {
  try {
    await AuditLog.create({ admin: adminId, action, targetType, targetId });
  } catch (err) {
    console.error("Audit log write failed:", err.message);
  }
};
