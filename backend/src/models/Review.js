import mongoose from "mongoose";

// A customer review, always tied to a completed order — this keeps
// reviews honest (only people who actually received the product can
// review it) and lets the admin trace a review back to its order.
const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "hidden"],
      default: "pending",
    },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ order: 1 }, { unique: true }); // one review per order

const Review = mongoose.model("Review", reviewSchema);

export default Review;
