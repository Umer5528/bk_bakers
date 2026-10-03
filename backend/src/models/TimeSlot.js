import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";

// Admin-configured fulfillment time slots. Global by default (apply to
// every product); a product can instead reference a specific subset via
// Product.customTimeSlotIds (see Product model) to override the slots it
// offers — e.g. a wedding cake only offering morning pickup slots.
const timeSlotSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true }, // e.g. "10:00 AM – 12:00 PM"
    startTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "startTime must be in HH:mm 24h format"],
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "endTime must be in HH:mm 24h format"],
    },
    fulfillmentTypes: {
      type: [String],
      enum: ["delivery", "pickup"],
      default: ["delivery", "pickup"],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "A time slot must apply to at least one fulfillment type",
      },
    },
    capacity: { type: Number, required: true, min: 1, default: 3 },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

timeSlotSchema.pre("validate", function (next) {
  if (this.startTime && this.endTime && this.startTime >= this.endTime) {
    return next(new ApiError(400, "A time slot's start time must be before its end time"));
  }
  next();
});

timeSlotSchema.index({ displayOrder: 1 });

const TimeSlot = mongoose.model("TimeSlot", timeSlotSchema);

export default TimeSlot;
