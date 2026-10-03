import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Order from "../models/Order.js";
import ApiError from "../utils/ApiError.js";

// @desc    List customers with their order stats (never exposes
//          customer data publicly — admin-only, per spec section 63)
// @route   GET /api/v1/customers
// @access  Private/Admin
export const getCustomers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;

  const filter = { role: "customer" };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const [customers, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  const stats = await Order.aggregate([
    { $match: { customer: { $in: customers.map((c) => c._id) } } },
    {
      $group: {
        _id: "$customer",
        totalOrders: { $sum: 1 },
        completedOrders: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        cancelledOrders: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
        totalSpent: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, "$totalAmount", 0],
          },
        },
        lastOrderAt: { $max: "$createdAt" },
      },
    },
  ]);
  const statsMap = new Map(stats.map((s) => [String(s._id), s]));

  const customersWithStats = customers.map((c) => {
    const s = statsMap.get(String(c._id));
    return {
      _id: c._id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      whatsapp: c.whatsapp,
      createdAt: c.createdAt,
      totalOrders: s?.totalOrders || 0,
      completedOrders: s?.completedOrders || 0,
      cancelledOrders: s?.cancelledOrders || 0,
      totalSpent: s?.totalSpent || 0,
      lastOrderAt: s?.lastOrderAt || null,
    };
  });

  res.status(200).json({
    success: true,
    count: customersWithStats.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    customers: customersWithStats,
  });
});

// @desc    Get one customer + their order history
// @route   GET /api/v1/customers/:id
// @access  Private/Admin
export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await User.findOne({ _id: req.params.id, role: "customer" });
  if (!customer) throw new ApiError(404, "Customer not found");

  const orders = await Order.find({ customer: customer._id }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, customer, orders });
});
