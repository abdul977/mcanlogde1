import express from "express";
import {
  createOrderController,
  getAllOrdersController,
  getOrderController,
  getUserOrdersController,
  updateOrderStatusController,
  cancelOrderController,
  getOrderStatsController,
  getRecentOrdersController,
  updateOrderPaymentController,
  addOrderNoteController,
  getOrderByNumberController
} from "../controller/Order.js";
import { requireSignIn, isAdmin } from "../middlewares/Auth.js";

const router = express.Router();

// User routes - Order management
router.post("/create", requireSignIn, createOrderController);
router.get("/my-orders", requireSignIn, getUserOrdersController);
router.get("/order/:orderNumber", requireSignIn, getOrderController);
router.put("/cancel/:id", requireSignIn, cancelOrderController);

// Public route for order tracking (with order number)
router.get("/track/:orderNumber", getOrderByNumberController);

// Admin routes - Order management
router.get("/admin/all", requireSignIn, isAdmin, getAllOrdersController);
router.get("/admin/recent", requireSignIn, isAdmin, getRecentOrdersController);
router.get("/admin/stats", requireSignIn, isAdmin, getOrderStatsController);
router.put("/admin/status/:id", requireSignIn, isAdmin, updateOrderStatusController);
router.put("/admin/payment/:id", requireSignIn, isAdmin, updateOrderPaymentController);
router.post("/admin/note/:id", requireSignIn, isAdmin, addOrderNoteController);

export default router;
