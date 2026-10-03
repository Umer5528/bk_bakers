import mongoose from "mongoose";

// Admin-managed calendar overrides — blocked dates and holidays. A date
// with no BlockedDate record is open by default (subject to the normal
// capacity/slot/cutoff rules computed by the availability engine).
const blockedDateSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
      set: (d) => {
        const normalized = new Date(d);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
      },
    },
    reason: { type: String, default: "" }, // e.g. "Eid Holiday", "Fully booked manually"
    isHoliday: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const BlockedDate = mongoose.model("BlockedDate", blockedDateSchema);

export default BlockedDate;
