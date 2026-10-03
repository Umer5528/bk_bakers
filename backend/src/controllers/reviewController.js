import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";

// @desc    Submit a review for a completed order (one review per order)
// @route   POST /api/v1/reviews
// @access  Private/Customer
export const createReview = asyncHandler(async (req, res) => {
  const { orderId, rating, comment } = req.body;
  if (!orderId || !rating) throw new ApiError(400, "orderId and rating are required");

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");
  if (String(order.customer) !== String(req.user._id)) {
    throw new ApiError(403, "You can only review your own orders");
  }
  if (order.status !== "completed") {
    throw new ApiError(400, "You can only review a completed order");
  }

  const existing = await Review.findOne({ order: orderId });
  if (existing) throw new ApiError(409, "You've already reviewed this order");

  const review = await Review.create({
    product: order.product,
    customer: req.user._id,
    order: orderId,
    rating,
    comment: comment || "",
  });

  res.status(201).json({ success: true, review });
});

// @desc    Get approved reviews for a product (public storefront display)
// @route   GET /api/v1/reviews?product=<id>
// @access  Public
export const getProductReviews = asyncHandler(async (req, res) => {
  const { product } = req.query;
  if (!product) throw new ApiError(400, "A product id is required");

  const reviews = await Review.find({ product, status: "approved" })
    .populate("customer", "name")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: reviews.length, reviews });
});

// @desc    List all reviews for moderation
// @route   GET /api/v1/reviews/admin
// @access  Private/Admin
export const getAllReviews = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const reviews = await Review.find(filter)
    .populate("customer", "name")
    .populate("product", "name slug")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: reviews.length, reviews });
});

// @desc    Moderate a review
// @route   PUT /api/v1/reviews/:id/moderate
// @access  Private/Admin
export const moderateReview = asyncHandler(async (req, res) => {
  const { status } = req.body; // approved | rejected | hidden
  if (!["approved", "rejected", "hidden"].includes(status)) {
    throw new ApiError(400, "status must be 'approved', 'rejected' or 'hidden'");
  }

  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");

  review.status = status;
  await review.save();

  // Keep the product's aggregate rating in sync with approved reviews.
  const approved = await Review.find({ product: review.product, status: "approved" });
  const ratingCount = approved.length;
  const ratingAverage = ratingCount
    ? approved.reduce((sum, r) => sum + r.rating, 0) / ratingCount
    : 0;
  await Product.findByIdAndUpdate(review.product, { ratingAverage, ratingCount });

  res.status(200).json({ success: true, review });
});
