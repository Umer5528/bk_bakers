import mongoose from "mongoose";
import slugify from "../utils/slugify.js";

// --- Reusable sub-schemas -------------------------------------------------
// Every product's *base* price comes from its weight/size options (a cake's
// "1 Pound / Rs. 1,000" style tiers). Everything else (shape, flavor,
// filling, and any custom option group like "Spice Level" or "Toppings")
// is a priceModifier layered on top. This is what keeps the architecture
// generic across Cakes, Burgers, Pizza, etc. without hardcoding "cake"
// anywhere in the schema.

const weightOptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true }, // e.g. "1 Pound", "Regular"
    price: { type: Number, required: true, min: 0 },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const modifierOptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    priceModifier: { type: Number, default: 0 },
    imageUrl: { type: String, default: null },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

// Generic, admin-defined option groups for anything beyond
// weight/shape/flavor/filling — e.g. "Spice Level", "Crust", "Add-ons".
const optionGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    selectionType: {
      type: String,
      enum: ["single", "multiple"],
      default: "single",
    },
    required: { type: Boolean, default: false },
    options: [modifierOptionSchema],
  },
  { _id: true }
);

const productImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: null },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [120, "Product name cannot exceed 120 characters"],
    },
    slug: { type: String, unique: true, index: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product must belong to a category"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    images: {
      type: [productImageSchema],
      validate: {
        validator: (arr) => arr.length <= 8,
        message: "A product can have at most 8 images",
      },
    },

    // --- Cake-style option vocabulary (kept as named fields since the
    // business is a cake shop first) — all admin-defined, never hardcoded.
    weightOptions: {
      type: [weightOptionSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one weight/size option with a price is required",
      },
    },
    shapeOptions: { type: [modifierOptionSchema], default: [] },
    flavorOptions: { type: [modifierOptionSchema], default: [] },
    fillingOptions: { type: [modifierOptionSchema], default: [] },

    // --- Generic extension point for any other product type ---
    extraOptionGroups: { type: [optionGroupSchema], default: [] },

    ingredients: { type: [String], default: [] },
    allergens: { type: [String], default: [] },
    specialInstructions: { type: String, default: "" },

    isCustomizable: { type: Boolean, default: false },
    preparationTimeHours: {
      type: Number,
      default: 4,
      min: [0, "Preparation time cannot be negative"],
    },

    // If set, this product only offers these specific time slots instead
    // of the full set of active global slots (e.g. a wedding cake that
    // only offers a morning pickup window).
    customTimeSlotIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "TimeSlot",
      default: [],
    },

    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.pre("validate", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = `${slugify(this.name)}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;
  }
  next();
});

// Lowest currently-active weight price — used for catalog "from Rs. X" tags.
productSchema.virtual("startingPrice").get(function () {
  const active = this.weightOptions.filter((w) => w.isActive);
  if (!active.length) return null;
  return Math.min(...active.map((w) => w.price));
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model("Product", productSchema);

export default Product;
