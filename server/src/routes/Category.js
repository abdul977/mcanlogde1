import express from "express";
import { requireSignIn } from "../middlewares/Auth.js";
import { requirePermission } from "../middlewares/PermissionAuth.js";
import { adminRateLimit } from "../middlewares/RateLimit.js";
import {
  categoryControlller,
  createCategoryController,
  deleteCategoryCOntroller,
  selectedCategoryController,
  singleCategoryController,
  updateCategoryController,
} from "../controller/Category.js";

const router = express.Router();

//routes
// create category (admin only) with RBAC
router.post(
  "/create-category",
  requireSignIn,
  adminRateLimit,
  requirePermission('categories', 'create'),
  createCategoryController
);

//update category (admin only) with RBAC
router.put(
  "/update-category/:id",
  requireSignIn,
  adminRateLimit,
  requirePermission('categories', 'update'),
  updateCategoryController
);

//getALl category (public)
router.get("/get-category", categoryControlller);

//single category (public)
router.get("/single-category/:slug", singleCategoryController);
router.get("/select-category/:slug", selectedCategoryController);

//delete category (admin only) with RBAC
router.delete(
  "/delete-category/:id",
  requireSignIn,
  adminRateLimit,
  requirePermission('categories', 'delete'),
  deleteCategoryCOntroller
);

export default router;
