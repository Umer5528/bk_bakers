import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import PaymentAccount from "../models/PaymentAccount.js";
import BusinessSettings from "../models/BusinessSettings.js";
import ApiError from "../utils/ApiError.js";
import { buildPriceSnapshot } from "../services/priceCalculator.js";
import { getAvailability } from "../services/availabilityEngine.js";
import { generateOrderNumber } from "../utils/orderNumber.js";
import { getFlowFor } from "../utils/orderStatusFlow.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";
import { logAdminAction } from "../utils/audit.js";

const parseJSON = (val, fallback) => {
  if (val === undefined) return fallback;
  if (typeof val !== "string") return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};

// @desc    Create an order. Every number here is computed server-side —
//          the frontend price/availability shown at checkout is only
//          ever a preview. This re-validates the product, the price,
//          fulfillment settings, the payment method, and — critically —
//          re-runs the availability engine so a slot that filled up
//          between "Review" and "Submit" is correctly rejected.
// @route   POST /api/v1/orders
// @access  Private/Customer
export const createOrder = asyncHandler(async (req, res) => {
  const body = req.body;

  // --- Duplicate-submission protection (double-click, slow network,
  //     refresh, retried request) ---
  if (body.idempotencyKey) {
    const existing = await Order.findOne({ idempotencyKey: body.idempotencyKey });
    if (existing) {
      return res.status(200).json({ success: true, order: existing, deduplicated: true });
    }
  }

  const product = await Product.findById(body.productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, "This product is no longer available");
  }

  const quantity = Math.max(1, parseInt(body.quantity, 10) || 1);

  const selections = {
    weightOptionId: body.weightOptionId,
    shapeOptionId: body.shapeOptionId,
    flavorOptionId: body.flavorOptionId,
    fillingOptionId: body.fillingOptionId,
    extraOptionGroups: parseJSON(body.extraOptionGroups, []),
  };

  // --- Server-authoritative price (never trust anything from the client) ---
  const { breakdown, unitTotal, selectedOptions } = buildPriceSnapshot(product, selections);
  const productSubtotal = unitTotal * quantity;

  const settings = await BusinessSettings.getSingleton();

  const fulfillmentType = body.fulfillmentType;
  if (!["delivery", "pickup"].includes(fulfillmentType)) {
    throw new ApiError(400, "A valid fulfillment type is required");
  }
  if (fulfillmentType === "delivery" && !settings.delivery.enabled) {
    throw new ApiError(400, "Delivery is currently unavailable");
  }
  if (fulfillmentType === "pickup" && !settings.pickup.enabled) {
    throw new ApiError(400, "Self-pickup is currently unavailable");
  }

  // --- Delivery charge (never trust a client-supplied fee) ---
  let deliveryCharge = 0;
  let deliveryAddress;
  let pickupLocationSnapshot;

  if (fulfillmentType === "delivery") {
    if (!body.deliveryAddress) {
      throw new ApiError(400, "A delivery address is required");
    }
    const addr = parseJSON(body.deliveryAddress, {});
    if (!addr.addressLine || !addr.phone) {
      throw new ApiError(400, "Delivery address and phone are required");
    }
    deliveryAddress = addr;

    if (body.deliveryZoneId) {
      const zone = settings.delivery.zones.id(body.deliveryZoneId);
      if (!zone || !zone.isActive) {
        throw new ApiError(400, "Selected delivery zone is no longer available");
      }
      deliveryCharge = zone.fee;
    } else {
      deliveryCharge = settings.delivery.defaultFee;
    }
  } else {
    // Self-pickup: delivery fee is always exactly zero — never just
    // hidden in the UI, actually zero on the server.
    deliveryCharge = 0;
    pickupLocationSnapshot = {
      address: settings.pickup.address,
      hours: settings.pickup.hours,
      instructions: settings.pickup.instructions,
      contactNumber: settings.pickup.contactNumber,
    };
  }

  const discount = 0;
  const totalAmount = Math.max(0, productSubtotal + deliveryCharge - discount);

  // --- Re-validate scheduling against the live availability engine —
  //     a slot shown as open during checkout may have filled since. ---
  if (!body.scheduledDate || !body.timeSlotId) {
    throw new ApiError(400, "A scheduled date and time slot are required");
  }
  const availability = await getAvailability({ product, fulfillmentType });
  const day = availability.days.find((d) => d.date === body.scheduledDate);
  if (!day || day.status === "closed" || day.status === "full") {
    throw new ApiError(409, "This date is no longer available — please choose another date");
  }
  const slot = day.slots.find((s) => String(s.id) === String(body.timeSlotId));
  if (!slot || slot.status === "full") {
    throw new ApiError(409, "This time slot is no longer available — please choose another");
  }

  // --- Payment method ---
  const paymentMethod = body.paymentMethod;
  if (!["online", "cash"].includes(paymentMethod)) {
    throw new ApiError(400, "A valid payment method is required");
  }
  if (paymentMethod === "online" && !settings.payments.onlineEnabled) {
    throw new ApiError(400, "Online payment is currently unavailable");
  }
  if (paymentMethod === "cash" && !settings.payments.cashEnabled) {
    throw new ApiError(400, "Cash payment is currently unavailable");
  }

  let paymentAccountSnapshot;
  let paymentReceipt;
  let paymentStatus = "pending";

  if (paymentMethod === "online") {
    if (!body.paymentAccountId) {
      throw new ApiError(400, "Please select a payment account");
    }
    const account = await PaymentAccount.findById(body.paymentAccountId);
    if (!account || !account.isActive) {
      throw new ApiError(400, "Selected payment account is no longer available");
    }
    paymentAccountSnapshot = {
      provider: account.provider,
      accountTitle: account.accountTitle,
      accountNumber: account.accountNumber,
    };

    // Receipt is REQUIRED for online payment — the order cannot be
    // created without one, enforced here on the server.
    if (!req.file) {
      throw new ApiError(400, "A payment receipt is required for online payment");
    }
    const uploaded = await uploadBufferToCloudinary(req.file.buffer, "bk-bakers/receipts");
    paymentReceipt = { url: uploaded.secure_url, publicId: uploaded.public_id };
    paymentStatus = "pending_verification";
  }
  // Cash: no receipt, paymentStatus stays "pending" until fulfillment.

  const orderNumber = await generateOrderNumber();

  const order = await Order.create({
    orderNumber,
    customer: req.user._id,
    product: product._id,
    productNameSnapshot: product.name,
    selectedOptions,
    quantity,
    priceBreakdown: breakdown,
    productSubtotal,
    deliveryCharge,
    discount,
    totalAmount,
    fulfillmentType,
    deliveryAddress,
    pickupLocationSnapshot,
    scheduledDate: new Date(body.scheduledDate),
    timeSlot: slot.id,
    timeSlotLabelSnapshot: slot.label,
    paymentMethod,
    paymentAccount: paymentAccountSnapshot,
    paymentReceipt,
    paymentStatus,
    customerNotes: body.customerNotes || "",
    idempotencyKey: body.idempotencyKey || undefined,
  });

  res.status(201).json({ success: true, order });
});

// @desc    Get the current customer's own orders
// @route   GET /api/v1/orders/mine
// @access  Private/Customer
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: orders.length, orders });
});

// @desc    Get a single order by its human-readable order number.
//          Customers may only view their own; admins may view any.
// @route   GET /api/v1/orders/:orderNumber
// @access  Private
export const getOrderByNumber = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber }).populate(
    "customer",
    "name email phone whatsapp"
  );
  if (!order) throw new ApiError(404, "Order not found");

  const isOwner = String(order.customer._id) === String(req.user._id);
  const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You do not have permission to view this order");
  }

  res.status(200).json({ success: true, order });
});

// @desc    List / search / filter all orders
// @route   GET /api/v1/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, paymentStatus, fulfillmentType, date, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  // Accepts a single status, or several separated by commas (e.g. the admin
  // panel's "In progress" tab). A single value behaves exactly as before.
  if (status) filter.status = status.includes(",") ? { $in: status.split(",") } : status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (fulfillmentType) filter.fulfillmentType = fulfillmentType;
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    filter.scheduledDate = { $gte: start, $lt: end };
  }
  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: "i" } },
      { productNameSnapshot: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    orders,
  });
});

// @desc    Verify or reject an online payment's receipt
// @route   PUT /api/v1/orders/:id/verify-payment
// @access  Private/Admin
export const verifyPayment = asyncHandler(async (req, res) => {
  const { action } = req.body; // "verify" | "reject"
  if (!["verify", "reject"].includes(action)) {
    throw new ApiError(400, "action must be 'verify' or 'reject'");
  }

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  if (order.paymentMethod !== "online") {
    throw new ApiError(400, "Only online payments require verification");
  }

  order.paymentStatus = action === "verify" ? "verified" : "rejected";
  await order.save();

  await logAdminAction(
    req.user._id,
    `${action === "verify" ? "Verified" : "Rejected"} payment for ${order.orderNumber}`,
    "Order",
    order._id
  );

  res.status(200).json({ success: true, order });
});

// @desc    Move an order to its next status. For "confirmed", an
//          expectedFulfillmentTime should be provided (spec section 47).
//          Online-paid orders must be payment-verified before they can
//          be confirmed; cash orders can be confirmed directly.
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, expectedFulfillmentTime } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  if (order.status === "cancelled") {
    throw new ApiError(400, "This order has been cancelled");
  }

  const flow = getFlowFor(order.fulfillmentType);
  if (!flow.includes(status)) {
    throw new ApiError(400, `"${status}" is not a valid status for a ${order.fulfillmentType} order`);
  }

  const currentIndex = flow.indexOf(order.status);
  const nextIndex = flow.indexOf(status);
  if (nextIndex <= currentIndex) {
    throw new ApiError(400, "Order status can only move forward");
  }

  if (status === "confirmed" && order.paymentMethod === "online" && order.paymentStatus !== "verified") {
    throw new ApiError(400, "Verify the payment before confirming this order");
  }

  order.status = status;
  if (expectedFulfillmentTime !== undefined) {
    order.expectedFulfillmentTime = expectedFulfillmentTime;
  }
  await order.save();

  await logAdminAction(req.user._id, `Set ${order.orderNumber} to "${status}"`, "Order", order._id);

  res.status(200).json({ success: true, order });
});

// @desc    Cancel an order (admin, or the customer themselves before
//          preparation begins)
// @route   PUT /api/v1/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  const isOwner = String(order.customer) === String(req.user._id);
  const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You do not have permission to cancel this order");
  }

  if (["completed", "cancelled"].includes(order.status)) {
    throw new ApiError(400, `This order is already ${order.status} and cannot be cancelled`);
  }

  // Customers may only self-cancel before preparation begins; admins can
  // cancel at any point up to completion.
  if (isOwner && !isAdmin && !["pending", "confirmed"].includes(order.status)) {
    throw new ApiError(400, "This order is already being prepared — please contact us to cancel it");
  }

  order.status = "cancelled";
  order.cancellation = {
    reason: req.body.reason || "",
    cancelledBy: req.user._id,
    cancelledAt: new Date(),
  };
  await order.save();

  res.status(200).json({ success: true, order });
});
