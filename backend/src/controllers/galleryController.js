import asyncHandler from "express-async-handler";
import GalleryItem from "../models/GalleryItem.js";
import ApiError from "../utils/ApiError.js";
import {
  uploadBufferToCloudinary,
  destroyCloudinaryAsset,
} from "../utils/cloudinaryUpload.js";

// @desc    List gallery items
// @route   GET /api/v1/gallery
// @access  Public
export const getGalleryItems = asyncHandler(async (req, res) => {
  const items = await GalleryItem.find().sort({ displayOrder: 1, createdAt: -1 });
  res.status(200).json({ success: true, count: items.length, items });
});

// @desc    Add a gallery item
// @route   POST /api/v1/gallery
// @access  Private/Admin
export const createGalleryItem = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "An image is required");

  const result = await uploadBufferToCloudinary(req.file.buffer, "bk-bakers/gallery");
  const item = await GalleryItem.create({
    image: { url: result.secure_url, publicId: result.public_id },
    caption: req.body.caption || "",
    category: req.body.category || "",
    isFeatured: req.body.isFeatured === "true" || req.body.isFeatured === true,
    displayOrder: req.body.displayOrder || 0,
  });

  res.status(201).json({ success: true, item });
});

// @desc    Update a gallery item's metadata
// @route   PUT /api/v1/gallery/:id
// @access  Private/Admin
export const updateGalleryItem = asyncHandler(async (req, res) => {
  const item = await GalleryItem.findById(req.params.id);
  if (!item) throw new ApiError(404, "Gallery item not found");

  const { caption, category, isFeatured, displayOrder } = req.body;
  if (caption !== undefined) item.caption = caption;
  if (category !== undefined) item.category = category;
  if (isFeatured !== undefined) item.isFeatured = isFeatured === "true" || isFeatured === true;
  if (displayOrder !== undefined) item.displayOrder = displayOrder;

  await item.save();
  res.status(200).json({ success: true, item });
});

// @desc    Delete a gallery item
// @route   DELETE /api/v1/gallery/:id
// @access  Private/Admin
export const deleteGalleryItem = asyncHandler(async (req, res) => {
  const item = await GalleryItem.findById(req.params.id);
  if (!item) throw new ApiError(404, "Gallery item not found");

  await destroyCloudinaryAsset(item.image?.publicId);
  await item.deleteOne();

  res.status(200).json({ success: true, message: "Gallery item deleted" });
});
