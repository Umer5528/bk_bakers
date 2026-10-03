import asyncHandler from "express-async-handler";
import TimeSlot from "../models/TimeSlot.js";
import ApiError from "../utils/ApiError.js";

// @desc    List time slots
// @route   GET /api/v1/time-slots
// @access  Public (customers need this to render checkout; only admins
//          can see inactive ones)
export const getTimeSlots = asyncHandler(async (req, res) => {
  const filter = req.user?.role === "admin" || req.user?.role === "superadmin"
    ? {}
    : { isActive: true };
  const slots = await TimeSlot.find(filter).sort({ displayOrder: 1, startTime: 1 });
  res.status(200).json({ success: true, count: slots.length, slots });
});

// @desc    Create a time slot
// @route   POST /api/v1/time-slots
// @access  Private/Admin
export const createTimeSlot = asyncHandler(async (req, res) => {
  const slot = await TimeSlot.create(req.body);
  res.status(201).json({ success: true, slot });
});

// @desc    Update a time slot
// @route   PUT /api/v1/time-slots/:id
// @access  Private/Admin
export const updateTimeSlot = asyncHandler(async (req, res) => {
  const slot = await TimeSlot.findById(req.params.id);
  if (!slot) throw new ApiError(404, "Time slot not found");

  Object.assign(slot, req.body);
  await slot.save();
  res.status(200).json({ success: true, slot });
});

// @desc    Delete a time slot
// @route   DELETE /api/v1/time-slots/:id
// @access  Private/Admin
export const deleteTimeSlot = asyncHandler(async (req, res) => {
  const slot = await TimeSlot.findById(req.params.id);
  if (!slot) throw new ApiError(404, "Time slot not found");
  await slot.deleteOne();
  res.status(200).json({ success: true, message: "Time slot deleted" });
});
