import asyncHandler from "express-async-handler";
import BlockedDate from "../models/BlockedDate.js";
import ApiError from "../utils/ApiError.js";

// @desc    List blocked dates/holidays (admin availability calendar)
// @route   GET /api/v1/blocked-dates
// @access  Private/Admin
export const getBlockedDates = asyncHandler(async (req, res) => {
  const dates = await BlockedDate.find().sort({ date: 1 });
  res.status(200).json({ success: true, count: dates.length, dates });
});

// @desc    Block a date (or mark a holiday)
// @route   POST /api/v1/blocked-dates
// @access  Private/Admin
export const blockDate = asyncHandler(async (req, res) => {
  const { date, reason, isHoliday } = req.body;
  if (!date) throw new ApiError(400, "A date is required");

  const existing = await BlockedDate.findOne({ date: new Date(date) });
  if (existing) throw new ApiError(409, "This date is already blocked");

  const blocked = await BlockedDate.create({ date, reason, isHoliday });
  res.status(201).json({ success: true, blocked });
});

// @desc    Unblock a date
// @route   DELETE /api/v1/blocked-dates/:id
// @access  Private/Admin
export const unblockDate = asyncHandler(async (req, res) => {
  const entry = await BlockedDate.findById(req.params.id);
  if (!entry) throw new ApiError(404, "Blocked date not found");
  await entry.deleteOne();
  res.status(200).json({ success: true, message: "Date unblocked" });
});
