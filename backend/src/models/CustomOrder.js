import mongoose from "mongoose";

// A dedicated request flow for fully custom cakes that don't map to an
// existing product listing. Admin reviews, quotes, and (Module 5) can
// convert an accepted quote into a normal Order while preserving all of
// this custom information.
const customOrderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    referenceImage: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },

    desiredWeight: { type: String, required: true },
    shape: { type: String, default: "" },
    flavor: { type: String, default: "" },
    filling: { type: String, default: "" },
    cakeMessage: { type: String, default: "" },
    colorTheme: { type: String, default: "" },
    description: { type: String, required: true },

    fulfillmentType: { type: String, enum: ["delivery", "pickup"], required: true },
    preferredDate: { type: Date, required: true },
    preferredTimeNote: { type: String, default: "" }, // free-text preference, e.g. "afternoon"

    contactPhone: { type: String, required: true },
    contactWhatsapp: { type: String, default: "" },

    status: {
      type: String,
      enum: ["pending_review", "quoted", "accepted", "rejected", "converted"],
      default: "pending_review",
    },
    quotedPrice: { type: Number, default: null, min: 0 },
    quotedAt: { type: Date, default: null },
    respondedAt: { type: Date, default: null },
    adminNotes: { type: String, default: "" },
    convertedOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  },
  { timestamps: true }
);

customOrderSchema.index({ customer: 1, createdAt: -1 });
customOrderSchema.index({ status: 1 });

const CustomOrder = mongoose.model("CustomOrder", customOrderSchema);

export default CustomOrder;
