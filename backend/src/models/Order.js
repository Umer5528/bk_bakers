import mongoose from "mongoose";

// Every order preserves a full historical snapshot — product name,
// selected option labels, and every price component — captured at the
// moment of purchase. If the admin later changes a product's price or
// deletes it entirely, this order's numbers and description must never
// change. See services/priceCalculator.js for how the snapshot is built.
const priceLineSchema = new mongoose.Schema(
  { label: String, amount: Number },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --- Product snapshot (never re-reads live product data later) ---
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    productNameSnapshot: { type: String, required: true },
    selectedOptions: {
      weight: { label: String, price: Number },
      shape: { label: String, priceModifier: Number },
      flavor: { label: String, priceModifier: Number },
      filling: { label: String, priceModifier: Number },
      extras: { type: [{ groupName: String, label: String, priceModifier: Number }], default: [] },
    },
    quantity: { type: Number, required: true, min: 1, default: 1 },

    // --- Pricing snapshot ---
    priceBreakdown: { type: [priceLineSchema], default: [] },
    productSubtotal: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, required: true, min: 0, default: 0 },
    discount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    // --- Fulfillment ---
    fulfillmentType: {
      type: String,
      enum: ["delivery", "pickup"],
      required: true,
    },
    deliveryAddress: {
      addressLine: String,
      phone: String,
      whatsapp: String,
      instructions: String,
    },
    pickupLocationSnapshot: {
      address: String,
      hours: String,
      instructions: String,
      contactNumber: String,
    },

    scheduledDate: { type: Date, required: true },
    timeSlot: { type: mongoose.Schema.Types.ObjectId, ref: "TimeSlot" },
    timeSlotLabelSnapshot: { type: String, required: true },
    expectedFulfillmentTime: { type: String, default: null }, // admin-confirmed, e.g. "5:00 PM – 6:00 PM"

    // --- Payment (fully wired up in Module 4) ---
    paymentMethod: { type: String, enum: ["online", "cash"], required: true },
    paymentAccount: {
      provider: String, // EasyPaisa / JazzCash / Bank
      accountTitle: String,
      accountNumber: String,
    },
    paymentReceipt: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "pending_verification", "verified", "rejected"],
      default: "pending",
    },

    // --- Order status (Module 4 will drive the transitions) ---
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
        "ready_for_pickup",
        "picked_up",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    cancellation: {
      reason: String,
      cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      cancelledAt: Date,
    },

    customerNotes: { type: String, default: "" },
    adminNotes: { type: String, default: "" },

    // Prevents accidental duplicate submissions from double-clicks, slow
    // networks, or refreshes.
    idempotencyKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ scheduledDate: 1, timeSlot: 1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
