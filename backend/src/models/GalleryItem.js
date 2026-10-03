import mongoose from "mongoose";

const galleryItemSchema = new mongoose.Schema(
  {
    image: {
      url: { type: String, required: true },
      publicId: { type: String, default: null },
    },
    caption: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "" }, // free-text label, e.g. "Wedding Cakes"
    isFeatured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

galleryItemSchema.index({ displayOrder: 1 });

const GalleryItem = mongoose.model("GalleryItem", galleryItemSchema);

export default GalleryItem;
