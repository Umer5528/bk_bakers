import mongoose from "mongoose";
import slugify from "../utils/slugify.js";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      maxlength: [60, "Category name cannot exceed 60 characters"],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    image: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-generate/refresh the slug from the name whenever it changes.
categorySchema.pre("validate", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name);
  }
  next();
});

categorySchema.index({ displayOrder: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
