import asyncHandler from "express-async-handler";
import CustomOrder from "../models/CustomOrder.js";
import ApiError from "../utils/ApiError.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

// @desc    Submit a custom cake request
// @route   POST /api/v1/custom-orders
// @access  Private/Customer
export const createCustomOrder = asyncHandler(async (req, res) => {
  const {
    desiredWeight,
    shape,
    flavor,
    filling,
    cakeMessage,
    colorTheme,
    description,
    fulfillmentType,
    preferredDate,
    preferredTimeNote,
    contactPhone,
    contactWhatsapp,
  } = req.body;

  if (!desiredWeight || !description || !fulfillmentType || !preferredDate || !contactPhone) {
    throw new ApiError(
      400,
      "Desired weight, description, fulfillment type, preferred date and contact phone are required"
    );
  }

  const data = {
    customer: req.user._id,
    desiredWeight,
    shape,
    flavor,
    filling,
    cakeMessage,
    colorTheme,
    description,
    fulfillmentType,
    preferredDate,
    preferredTimeNote,
    contactPhone,
    contactWhatsapp,
  };

  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, "bk-bakers/custom-orders");
    data.referenceImage = { url: result.secure_url, publicId: result.public_id };
  }

  const customOrder = await CustomOrder.create(data);
  res.status(201).json({ success: true, customOrder });
});

// @desc    Get the current customer's own custom cake requests
// @route   GET /api/v1/custom-orders/mine
// @access  Private/Customer
export const getMyCustomOrders = asyncHandler(async (req, res) => {
  const orders = await CustomOrder.find({ customer: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: orders.length, customOrders: orders });
});

// @desc    List all custom cake requests
// @route   GET /api/v1/custom-orders
// @access  Private/Admin
export const getAllCustomOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const orders = await CustomOrder.find(filter)
    .populate("customer", "name email phone whatsapp")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: orders.length, customOrders: orders });
});

// @desc    Send a quotation for a custom cake request
// @route   PUT /api/v1/custom-orders/:id/quote
// @access  Private/Admin
export const quoteCustomOrder = asyncHandler(async (req, res) => {
  const { quotedPrice, adminNotes } = req.body;
  if (!quotedPrice || quotedPrice <= 0) {
    throw new ApiError(400, "A valid quoted price is required");
  }

  const customOrder = await CustomOrder.findById(req.params.id);
  if (!customOrder) throw new ApiError(404, "Custom cake request not found");
  if (!["pending_review", "quoted"].includes(customOrder.status)) {
    throw new ApiError(400, "This request has already been resolved");
  }

  customOrder.quotedPrice = quotedPrice;
  customOrder.adminNotes = adminNotes || customOrder.adminNotes;
  customOrder.status = "quoted";
  customOrder.quotedAt = new Date();
  await customOrder.save();

  res.status(200).json({ success: true, customOrder });
});

// @desc    Customer accepts or rejects their quotation
// @route   PUT /api/v1/custom-orders/:id/respond
// @access  Private/Customer
export const respondToQuote = asyncHandler(async (req, res) => {
  const { accept } = req.body;

  const customOrder = await CustomOrder.findById(req.params.id);
  if (!customOrder) throw new ApiError(404, "Custom cake request not found");
  if (String(customOrder.customer) !== String(req.user._id)) {
    throw new ApiError(403, "This isn't your request");
  }
  if (customOrder.status !== "quoted") {
    throw new ApiError(400, "There's no pending quotation on this request");
  }

  customOrder.status = accept ? "accepted" : "rejected";
  customOrder.respondedAt = new Date();
  await customOrder.save();

  res.status(200).json({ success: true, customOrder });
});

// @desc    Reject a custom cake request outright (no quotation)
// @route   PUT /api/v1/custom-orders/:id/reject
// @access  Private/Admin
export const rejectCustomOrder = asyncHandler(async (req, res) => {
  const customOrder = await CustomOrder.findById(req.params.id);
  if (!customOrder) throw new ApiError(404, "Custom cake request not found");

  customOrder.status = "rejected";
  customOrder.adminNotes = req.body.adminNotes || customOrder.adminNotes;
  await customOrder.save();

  res.status(200).json({ success: true, customOrder });
});
