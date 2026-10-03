import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import { getAvailability } from "../services/availabilityEngine.js";

// @desc    Get available dates & time slots for a product + fulfillment
//          type, computed by the smart availability engine. The frontend
//          date/time pickers only ever render what this returns.
// @route   GET /api/v1/scheduling/availability?product=<slug>&fulfillmentType=delivery
// @access  Public
export const getProductAvailability = asyncHandler(async (req, res) => {
  const { product: productSlug, fulfillmentType } = req.query;

  if (!productSlug) throw new ApiError(400, "A product slug is required");

  const product = await Product.findOne({ slug: productSlug, isActive: true });
  if (!product) throw new ApiError(404, "Product not found");

  const availability = await getAvailability({ product, fulfillmentType });
  res.status(200).json({ success: true, ...availability });
});
