import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your full name"],
      trim: true,
      maxlength: [80, "Name cannot exceed 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Please provide a phone number"],
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
      default: null,
    },
    isWhatsappSameAsPhone: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    // "superadmin" is the developer/owner-level account — it sits above
    // "admin" (the business/day-to-day operator role) and can do
    // everything an admin can, plus anything superadmin-only added in
    // later modules (e.g. managing other admin accounts).
    role: {
      type: String,
      enum: ["customer", "admin", "superadmin"],
      default: "customer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Keep whatsapp in sync when the customer says it's the same as their phone.
userSchema.pre("save", function (next) {
  if (this.isWhatsappSameAsPhone) {
    this.whatsapp = this.phone;
  }
  next();
});

// Hash the password whenever it's set/changed.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ role: 1 });

const User = mongoose.model("User", userSchema);

export default User;
