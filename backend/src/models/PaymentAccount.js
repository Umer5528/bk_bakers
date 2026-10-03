import mongoose from "mongoose";

// Admin-managed online payment accounts (EasyPaisa, JazzCash, Bank, or
// any other provider added later). Never hardcoded — the owner adds,
// edits, activates/deactivates these herself.
const paymentAccountSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      required: [true, "Provider is required"],
      trim: true, // e.g. "EasyPaisa", "JazzCash", "Bank", "Other"
    },
    accountTitle: { type: String, required: [true, "Account title is required"], trim: true },
    accountNumber: { type: String, required: [true, "Account number is required"], trim: true },
    bankName: { type: String, trim: true, default: "" }, // Bank-only
    iban: { type: String, trim: true, default: "" }, // Bank-only
    instructions: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

paymentAccountSchema.index({ displayOrder: 1 });

const PaymentAccount = mongoose.model("PaymentAccount", paymentAccountSchema);

export default PaymentAccount;
