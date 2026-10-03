import express from "express";
import {
  getProducts,
  getProductBySlug,
  calculatePrice,
  createProduct,
  updateProduct,
  deleteProductImage,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, authorize, identify } from "../middleware/auth.js";
import { uploadImages } from "../middleware/upload.js";

const router = express.Router();

router.get("/", identify, getProducts);
router.get("/:slug", identify, getProductBySlug);
router.post("/:slug/calculate-price", calculatePrice);

router.post(
  "/",
  protect,
  authorize("admin"),
  uploadImages.array("images", 8),
  createProduct
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  uploadImages.array("images", 8),
  updateProduct
);
router.delete("/:id/images/:imageId", protect, authorize("admin"), deleteProductImage);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

export default router;
