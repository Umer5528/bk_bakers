import asyncHandler from "express-async-handler";
import PaymentAccount from "../models/PaymentAccount.js";
import ApiError from "../utils/ApiError.js";

// @desc    List payment accounts — customers only see active ones
//          (what they'll be asked to pay into); admins see all.
// @route   GET /api/v1/payment-accounts
// @access  Public
export const getPaymentAccounts = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === "admin" || req.user?.role === "superadmin";
  const filter = isAdmin ? {} : { isActive: true };
  const accounts = await PaymentAccount.find(filter).sort({ displayOrder: 1, createdAt: 1 });
  res.status(200).json({ success: true, count: accounts.length, accounts });
});

// @desc    Add a payment account
// @route   POST /api/v1/payment-accounts
// @access  Private/Admin
export const createPaymentAccount = asyncHandler(async (req, res) => {
  const account = await PaymentAccount.create(req.body);
  res.status(201).json({ success: true, account });
});

// @desc    Update a payment account
// @route   PUT /api/v1/payment-accounts/:id
// @access  Private/Admin
export const updatePaymentAccount = asyncHandler(async (req, res) => {
  const account = await PaymentAccount.findById(req.params.id);
  if (!account) throw new ApiError(404, "Payment account not found");
  Object.assign(account, req.body);
  await account.save();
  res.status(200).json({ success: true, account });
});

// @desc    Delete a payment account
// @route   DELETE /api/v1/payment-accounts/:id
// @access  Private/Admin
export const deletePaymentAccount = asyncHandler(async (req, res) => {
  const account = await PaymentAccount.findById(req.params.id);
  if (!account) throw new ApiError(404, "Payment account not found");
  await account.deleteOne();
  res.status(200).json({ success: true, message: "Payment account deleted" });
});
