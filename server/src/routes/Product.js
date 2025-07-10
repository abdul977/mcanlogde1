import express from "express";
import {
  createProductController,
  getAllProductsController,
  getProductController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  getFeaturedProductsController,
  getProductsByCategoryController,
  searchProductsController,
  updateProductStatusController,
  getProductStatsController,
  bulkUpdateProductsController,
  getRelatedProductsController,
  updateProductInventoryController
} from "../controller/Product.js";
import { requireSignIn, isAdmin } from "../middlewares/Auth.js";

const router = express.Router();

// Public routes - Product display
router.get("/", getAllProductsController);
router.get("/featured", getFeaturedProductsController);
router.get("/category/:categoryId", getProductsByCategoryController);
router.get("/search/:keyword", searchProductsController);
router.get("/:slug", getProductController);
router.get("/:id/related", getRelatedProductsController);

// Admin routes - Product management
router.get("/admin/get-product-by-id/:id", requireSignIn, isAdmin, getProductByIdController);
router.post("/admin/create", requireSignIn, isAdmin, createProductController);
router.put("/admin/update/:id", requireSignIn, isAdmin, updateProductController);
router.delete("/admin/delete/:id", requireSignIn, isAdmin, deleteProductController);
router.put("/admin/status/:id", requireSignIn, isAdmin, updateProductStatusController);
router.put("/admin/inventory/:id", requireSignIn, isAdmin, updateProductInventoryController);
router.put("/admin/bulk-update", requireSignIn, isAdmin, bulkUpdateProductsController);
router.get("/admin/stats", requireSignIn, isAdmin, getProductStatsController);

export default router;
