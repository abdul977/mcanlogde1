import express from "express";
import {
  createProductCategoryController,
  getAllProductCategoriesController,
  getProductCategoryController,
  updateProductCategoryController,
  deleteProductCategoryController,
  getFeaturedCategoriesController,
  getMenuCategoriesController,
  getHomepageCategoriesController,
  getRootCategoriesController,
  getSubcategoriesController,
  getCategoryStatsController
} from "../controller/ProductCategory.js";
import { requireSignIn, isAdmin } from "../middlewares/Auth.js";

const router = express.Router();

// Public routes - Category display
router.get("/", getAllProductCategoriesController);
router.get("/featured", getFeaturedCategoriesController);
router.get("/menu", getMenuCategoriesController);
router.get("/homepage", getHomepageCategoriesController);
router.get("/root", getRootCategoriesController);
router.get("/:id/subcategories", getSubcategoriesController);
router.get("/:slug", getProductCategoryController);

// Admin routes - Category management
router.post("/admin/create", requireSignIn, isAdmin, createProductCategoryController);
router.put("/admin/update/:id", requireSignIn, isAdmin, updateProductCategoryController);
router.delete("/admin/delete/:id", requireSignIn, isAdmin, deleteProductCategoryController);
router.get("/admin/stats", requireSignIn, isAdmin, getCategoryStatsController);

export default router;
