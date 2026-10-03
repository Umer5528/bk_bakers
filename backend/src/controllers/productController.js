import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import ApiError from "../utils/ApiError.js";
import { calculateProductPrice } from "../services/priceCalculator.js";
import {
  uploadBufferToCloudinary,
  destroyCloudinaryAsset,
} from "../utils/cloudinaryUpload.js";
import { logAdminAction } from "../utils/audit.js";

const parseJSONField = (value, fallback) => {
  if (value === undefined) return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

// @desc    Browse products — search, filter by category, sort, paginate.
//          Only active products with an active category are ever shown
//          to non-admins.
// @route   GET /api/v1/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category, // category slug
    featured,
    sort = "newest",
    page = 1,
    limit = 12,
  } = req.query;

  const isAdmin = req.user?.role === "admin" || req.user?.role === "superadmin";
  const filter = isAdmin ? {} : { isActive: true };

  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (!cat) {
      return res.status(200).json({ success: true, count: 0, total: 0, products: [] });
    }
    filter.category = cat._id;
  }

  if (featured === "true") filter.isFeatured = true;

  if (search) {
    filter.$text = { $search: search };
  }

  const sortMap = {
    newest: { createdAt: -1 },
    "price-asc": { "weightOptions.0.price": 1 },
    "price-desc": { "weightOptions.0.price": -1 },
    name: { name: 1 },
    popular: { ratingAverage: -1, ratingCount: -1 },
  };
  const sortBy = sortMap[sort] || sortMap.newest;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(48, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    products,
  });
});

// @desc    Get a single product's full profile by slug
// @route   GET /api/v1/products/:slug
// @access  Public
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate(
    "category",
    "name slug"
  );

  if (!product || (!product.isActive && req.user?.role !== "admin" && req.user?.role !== "superadmin")) {
    throw new ApiError(404, "Product not found");
  }

  res.status(200).json({ success: true, product });
});

// @desc    Server-authoritative price preview for a set of selected options.
//          Never trust a price computed on the frontend — this is the
//          same function Module 3/4's checkout will call again.
// @route   POST /api/v1/products/:slug/calculate-price
// @access  Public
export const calculatePrice = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not found");
  }

  const result = calculateProductPrice(product, req.body || {});
  res.status(200).json({ success: true, ...result });
});

// @desc    Create a product
// @route   POST /api/v1/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const body = req.body;

  if (!body.name || !body.category) {
    throw new ApiError(400, "Product name and category are required");
  }

  const categoryExists = await Category.findById(body.category);
  if (!categoryExists) throw new ApiError(400, "Selected category does not exist");

  const weightOptions = parseJSONField(body.weightOptions, []);
  if (!Array.isArray(weightOptions) || weightOptions.length === 0) {
    throw new ApiError(400, "At least one weight/size option with a price is required");
  }

  const images = [];
  if (req.files?.length) {
    for (const [index, file] of req.files.entries()) {
      const result = await uploadBufferToCloudinary(
        file.buffer,
        "bk-bakers/products"
      );
      images.push({
        url: result.secure_url,
        publicId: result.public_id,
        isPrimary: index === 0,
      });
    }
  }

  const product = await Product.create({
    name: body.name,
    category: body.category,
    description: body.description || "",
    images,
    weightOptions,
    shapeOptions: parseJSONField(body.shapeOptions, []),
    flavorOptions: parseJSONField(body.flavorOptions, []),
    fillingOptions: parseJSONField(body.fillingOptions, []),
    extraOptionGroups: parseJSONField(body.extraOptionGroups, []),
    ingredients: parseJSONField(body.ingredients, []),
    allergens: parseJSONField(body.allergens, []),
    specialInstructions: body.specialInstructions || "",
    isCustomizable: body.isCustomizable === "true" || body.isCustomizable === true,
    preparationTimeHours: body.preparationTimeHours || 4,
    isFeatured: body.isFeatured === "true" || body.isFeatured === true,
  });

  res.status(201).json({ success: true, product });
});

// @desc    Update a product (partial — only provided fields change)
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  const body = req.body;
  const directFields = [
    "name",
    "description",
    "specialInstructions",
    "preparationTimeHours",
    "isActive",
    "isFeatured",
    "isCustomizable",
    "category",
  ];
  for (const field of directFields) {
    if (body[field] !== undefined) {
      product[field] =
        body[field] === "true" ? true : body[field] === "false" ? false : body[field];
    }
  }

  const jsonFields = [
    "weightOptions",
    "shapeOptions",
    "flavorOptions",
    "fillingOptions",
    "extraOptionGroups",
    "ingredients",
    "allergens",
  ];
  for (const field of jsonFields) {
    if (body[field] !== undefined) {
      product[field] = parseJSONField(body[field], product[field]);
    }
  }

  if (product.weightOptions.length === 0) {
    throw new ApiError(400, "A product must keep at least one weight/size option");
  }

  if (req.files?.length) {
    for (const file of req.files) {
      const result = await uploadBufferToCloudinary(
        file.buffer,
        "bk-bakers/products"
      );
      product.images.push({
        url: result.secure_url,
        publicId: result.public_id,
        isPrimary: product.images.length === 0,
      });
    }
  }

  await product.save();

  if (body.weightOptions !== undefined) {
    await logAdminAction(req.user._id, `Updated pricing for "${product.name}"`, "Product", product._id);
  }

  res.status(200).json({ success: true, product });
});

// @desc    Remove a single image from a product
// @route   DELETE /api/v1/products/:id/images/:imageId
// @access  Private/Admin
export const deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  const image = product.images.id(req.params.imageId);
  if (!image) throw new ApiError(404, "Image not found");

  await destroyCloudinaryAsset(image.publicId);
  image.deleteOne();
  await product.save();

  res.status(200).json({ success: true, product });
});

// @desc    Delete a product entirely
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  for (const image of product.images) {
    await destroyCloudinaryAsset(image.publicId);
  }
  await product.deleteOne();

  res.status(200).json({ success: true, message: "Product deleted" });
});
