import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import {
  uploadBufferToCloudinary,
  destroyCloudinaryAsset,
} from "../utils/cloudinaryUpload.js";

// @desc    List categories. Public callers only see active ones; admins
//          (via ?all=true, still gated behind the admin route) see all.
// @route   GET /api/v1/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const filter = req.query.all === "true" && (req.user?.role === "admin" || req.user?.role === "superadmin")
    ? {}
    : { isActive: true };

  const categories = await Category.find(filter).sort({
    displayOrder: 1,
    name: 1,
  });

  res.status(200).json({ success: true, count: categories.length, categories });
});

// @desc    Get a single category by slug, with a quick active-product count
// @route   GET /api/v1/categories/:slug
// @access  Public
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category || (!category.isActive && req.user?.role !== "admin" && req.user?.role !== "superadmin")) {
    throw new ApiError(404, "Category not found");
  }

  const productCount = await Product.countDocuments({
    category: category._id,
    isActive: true,
  });

  res.status(200).json({ success: true, category, productCount });
});

// @desc    Create a category (any name the owner wants — never hardcoded)
// @route   POST /api/v1/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, displayOrder } = req.body;
  if (!name) throw new ApiError(400, "Category name is required");

  const data = { name, description, displayOrder };

  if (req.file) {
    const result = await uploadBufferToCloudinary(
      req.file.buffer,
      "bk-bakers/categories"
    );
    data.image = { url: result.secure_url, publicId: result.public_id };
  }

  const category = await Category.create(data);
  res.status(201).json({ success: true, category });
});

// @desc    Update a category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  const { name, description, displayOrder, isActive } = req.body;
  if (name !== undefined) category.name = name;
  if (description !== undefined) category.description = description;
  if (displayOrder !== undefined) category.displayOrder = displayOrder;
  if (isActive !== undefined) category.isActive = isActive;

  if (req.file) {
    await destroyCloudinaryAsset(category.image?.publicId);
    const result = await uploadBufferToCloudinary(
      req.file.buffer,
      "bk-bakers/categories"
    );
    category.image = { url: result.secure_url, publicId: result.public_id };
  }

  await category.save();
  res.status(200).json({ success: true, category });
});

// @desc    Delete a category. Blocked if products still reference it, so
//          the owner can't silently orphan products.
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    throw new ApiError(
      409,
      `Cannot delete "${category.name}" — it still has ${productCount} product(s). Move or delete them first.`
    );
  }

  await destroyCloudinaryAsset(category.image?.publicId);
  await category.deleteOne();

  res.status(200).json({ success: true, message: "Category deleted" });
});
