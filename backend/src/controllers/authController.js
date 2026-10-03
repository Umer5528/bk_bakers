import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { sendTokenResponse } from "../utils/generateToken.js";
import { generateResetToken, hashToken } from "../utils/crypto.js";

// @desc    Register a new customer account
// @route   POST /api/v1/auth/register
// @access  Public
export const registerCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone, whatsapp, isWhatsappSameAsPhone, password } =
    req.body;

  if (!name || !email || !phone || !password) {
    throw new ApiError(400, "Name, email, phone and password are required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    phone,
    whatsapp: isWhatsappSameAsPhone ? phone : whatsapp || null,
    isWhatsappSameAsPhone: !!isWhatsappSameAsPhone,
    password,
    role: "customer",
  });

  sendTokenResponse(user, 201, res);
});

// @desc    Login (customer or admin — role comes from the stored user)
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please provide email and password");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "This account has been deactivated");
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// @desc    Register the first/an admin account, gated by a setup key
//          so this can never be reached by a random customer.
// @route   POST /api/v1/auth/admin/register
// @access  Public (requires ADMIN_SETUP_KEY)
export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, phone, password, setupKey } = req.body;

  if (!setupKey || setupKey !== process.env.ADMIN_SETUP_KEY) {
    throw new ApiError(403, "Invalid setup key");
  }

  if (!name || !email || !phone || !password) {
    throw new ApiError(400, "Name, email, phone and password are required");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const admin = await User.create({
    name,
    email,
    phone,
    password,
    role: "admin",
  });

  sendTokenResponse(admin, 201, res);
});

// @desc    Register a superadmin account (the developer/owner-level
//          role). Gated by its own, separate setup key so it can never
//          be reached with the regular admin key.
// @route   POST /api/v1/auth/superadmin/register
// @access  Public (requires SUPER_ADMIN_SETUP_KEY)
export const registerSuperAdmin = asyncHandler(async (req, res) => {
  const { name, email, phone, password, setupKey } = req.body;

  if (!setupKey || setupKey !== process.env.SUPER_ADMIN_SETUP_KEY) {
    throw new ApiError(403, "Invalid setup key");
  }

  if (!name || !email || !phone || !password) {
    throw new ApiError(400, "Name, email, phone and password are required");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const superAdmin = await User.create({
    name,
    email,
    phone,
    password,
    role: "superadmin",
  });

  sendTokenResponse(superAdmin, 201, res);
});

// @desc    Log the current user out by clearing the auth cookie
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// @desc    Get the currently authenticated user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// @desc    Update own profile (name, phone, whatsapp — not email/role)
// @route   PUT /api/v1/auth/me
// @access  Private
export const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, whatsapp, isWhatsappSameAsPhone } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (isWhatsappSameAsPhone !== undefined) {
    updates.isWhatsappSameAsPhone = isWhatsappSameAsPhone;
    updates.whatsapp = isWhatsappSameAsPhone ? phone || req.user.phone : whatsapp;
  } else if (whatsapp !== undefined) {
    updates.whatsapp = whatsapp;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, user });
});

// @desc    Change own password
// @route   PUT /api/v1/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current and new password are required");
  }
  if (newPassword.length < 8) {
    throw new ApiError(400, "New password must be at least 8 characters");
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.matchPassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Request a password reset. Always responds the same way whether
//          or not the email exists, to avoid leaking which emails are
//          registered.
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Please provide an email");

  const user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    const { rawToken, hashedToken } = generateResetToken();
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // MODULE 6 TODO: wire this into Nodemailer/SMS. For now the reset
    // link is logged server-side so the flow is fully testable end to end.
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
    console.log(`Password reset requested for ${user.email}: ${resetUrl}`);
  }

  res.status(200).json({
    success: true,
    message:
      "If an account exists with that email, a password reset link has been sent.",
  });
});

// @desc    Reset password using the raw token from the reset link
// @route   PUT /api/v1/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const hashedToken = hashToken(req.params.token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "This reset link is invalid or has expired");
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});
