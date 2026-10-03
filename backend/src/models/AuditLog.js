import mongoose from "mongoose";

// A lightweight trail of consequential admin actions (price changes,
// payment verification, settings changes, etc.) — enough to answer
// "who did what, and when" without building a full audit framework.
const auditLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g. "Verified payment for ORD-2026-00012"
    targetType: { type: String, default: "" }, // "Order", "Product", "Settings", ...
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
