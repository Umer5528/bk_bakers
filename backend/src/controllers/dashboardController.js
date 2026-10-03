import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import CustomOrder from "../models/CustomOrder.js";
import Product from "../models/Product.js";

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// @desc    Aggregate stats for the admin dashboard — kept intentionally
//          focused on what a small business owner actually needs day to
//          day, not an overloaded analytics screen (spec section 51/89).
// @route   GET /api/v1/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    todayOrders,
    weekOrders,
    monthOrders,
    pendingVerification,
    completedOrders,
    cancelledOrders,
    pendingCustomOrders,
    revenueAgg,
    fulfillmentAgg,
    paymentMethodAgg,
    popularProductsAgg,
    todayPickups,
    todayDeliveries,
  ] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: todayStart } }),
    Order.countDocuments({ createdAt: { $gte: weekStart } }),
    Order.countDocuments({ createdAt: { $gte: monthStart } }),
    Order.countDocuments({ paymentMethod: "online", paymentStatus: "pending_verification" }),
    Order.countDocuments({ status: "completed" }),
    Order.countDocuments({ status: "cancelled" }),
    CustomOrder.countDocuments({ status: "pending_review" }),
    Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: "$fulfillmentType", count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: "$paymentMethod", count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: "$productNameSnapshot", count: { $sum: "$quantity" } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    Order.countDocuments({
      fulfillmentType: "pickup",
      scheduledDate: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 86400000) },
      status: { $ne: "cancelled" },
    }),
    Order.countDocuments({
      fulfillmentType: "delivery",
      scheduledDate: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 86400000) },
      status: { $ne: "cancelled" },
    }),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      ordersToday: todayOrders,
      ordersThisWeek: weekOrders,
      ordersThisMonth: monthOrders,
      pendingPaymentVerification: pendingVerification,
      completedOrders,
      cancelledOrders,
      pendingCustomRequests: pendingCustomOrders,
      totalRevenue: revenueAgg[0]?.total || 0,
      fulfillmentSplit: fulfillmentAgg.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
      paymentMethodSplit: paymentMethodAgg.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
      popularProducts: popularProductsAgg.map((p) => ({ name: p._id, quantity: p.count })),
      todayPickups,
      todayDeliveries,
    },
  });
});
