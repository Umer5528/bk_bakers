import asyncHandler from "express-async-handler";
import BusinessSettings from "../models/BusinessSettings.js";
import {
  uploadBufferToCloudinary,
  destroyCloudinaryAsset,
} from "../utils/cloudinaryUpload.js";
import { logAdminAction } from "../utils/audit.js";

// @desc    Get business settings (public fields only — delivery/pickup
//          config, business info — needed to render checkout & footer)
// @route   GET /api/v1/settings
// @access  Public
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await BusinessSettings.getSingleton();
  res.status(200).json({ success: true, settings });
});

// @desc    Update business settings (partial merge)
// @route   PUT /api/v1/settings
// @access  Private/Admin
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await BusinessSettings.getSingleton();
  const body = req.body;

  const parseJSON = (val, fallback) => {
    if (val === undefined) return fallback;
    if (typeof val !== "string") return val;
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  };

  const topLevelFields = [
    "businessName",
    "slogan",
    "phone",
    "whatsapp",
    "email",
    "aboutText",
    "minAdvanceNoticeHours",
    "sameDayCutoffTime",
    "maxOrdersPerDay",
    "schedulingHorizonDays",
  ];
  for (const field of topLevelFields) {
    if (body[field] !== undefined) settings[field] = body[field];
  }

  if (body.socialLinks !== undefined) {
    settings.socialLinks = {
      ...settings.socialLinks.toObject(),
      ...parseJSON(body.socialLinks, {}),
    };
  }
  if (body.delivery !== undefined) {
    settings.delivery = { ...settings.delivery.toObject(), ...parseJSON(body.delivery, {}) };
  }
  if (body.pickup !== undefined) {
    settings.pickup = { ...settings.pickup.toObject(), ...parseJSON(body.pickup, {}) };
  }
  if (body.payments !== undefined) {
    settings.payments = { ...settings.payments.toObject(), ...parseJSON(body.payments, {}) };
  }

  if (req.file) {
    await destroyCloudinaryAsset(settings.logo?.publicId);
    const result = await uploadBufferToCloudinary(req.file.buffer, "bk-bakers/branding");
    settings.logo = { url: result.secure_url, publicId: result.public_id };
  }

  await settings.save();
  await logAdminAction(req.user._id, "Updated business settings", "Settings", settings._id);

  res.status(200).json({ success: true, settings });
});
