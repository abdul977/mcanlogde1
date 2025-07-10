import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Create order (user)
export const createOrderController = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      customerNotes,
      couponCode,
      shippingMethod = 'standard'
    } = req.body;

    const userId = req.user._id || req.user.id;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Order items are required"
      });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address) {
      return res.status(400).send({
        success: false,
        message: "Complete shipping address is required"
      });
    }

    if (!paymentMethod) {
      return res.status(400).send({
        success: false,
        message: "Payment method is required"
      });
    }

    // Validate and process order items
    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).send({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (product.status !== 'active' || !product.isVisible) {
        return res.status(400).send({
          success: false,
          message: `Product is not available: ${product.name}`
        });
      }

      // Check inventory
      if (product.inventory.trackQuantity) {
        const availableQuantity = product.inventory.quantity - product.inventory.reservedQuantity;
        if (availableQuantity < item.quantity) {
          return res.status(400).send({
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${availableQuantity}, Requested: ${item.quantity}`
          });
        }
      }

      const unitPrice = product.price;
      const totalPrice = unitPrice * item.quantity;

      processedItems.push({
        product: product._id,
        productSnapshot: {
          name: product.name,
          sku: product.sku,
          price: product.price,
          image: product.images.find(img => img.isPrimary)?.url || product.images[0]?.url
        },
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        variants: item.variants || [],
        notes: item.notes || ''
      });

      subtotal += totalPrice;
    }

    // Calculate shipping cost (simplified logic)
    let shippingCost = 0;
    switch (shippingMethod) {
      case 'express':
        shippingCost = 2000;
        break;
      case 'same_day':
        shippingCost = 5000;
        break;
      case 'standard':
      default:
        shippingCost = subtotal > 50000 ? 0 : 1000; // Free shipping over 50k
        break;
    }

    // Calculate tax (simplified - 7.5% VAT)
    const taxAmount = subtotal * 0.075;

    // Apply discount if coupon provided (simplified logic)
    let discountAmount = 0;
    // TODO: Implement coupon validation logic

    const totalAmount = subtotal + taxAmount + shippingCost - discountAmount;

    // Create order
    const order = new Order({
      user: userId,
      items: processedItems,
      subtotal,
      taxAmount,
      shippingCost,
      discountAmount,
      totalAmount,
      paymentMethod,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      shippingMethod,
      customerNotes,
      couponCode,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await order.save();

    // Reserve inventory
    for (const item of processedItems) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { 'inventory.reservedQuantity': item.quantity }
        });
      }
    }

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'name sku images');

    res.status(201).send({
      success: true,
      message: "Order created successfully",
      order: populatedOrder
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).send({
      success: false,
      message: "Error while creating order",
      error: error.message
    });
  }
};

// Get user orders (user)
export const getUserOrdersController = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate('items.product', 'name sku images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.status(200).send({
      success: true,
      message: "User orders fetched successfully",
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).send({
      success: false,
      message: "Error while fetching user orders",
      error: error.message
    });
  }
};

// Get single order (user/admin)
export const getOrderController = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;

    const query = { orderNumber };
    
    // Non-admin users can only see their own orders
    if (userRole !== 'admin') {
      query.user = userId;
    }

    const order = await Order.findOne(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name sku images slug');

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).send({
      success: true,
      message: "Order fetched successfully",
      order
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).send({
      success: false,
      message: "Error while fetching order",
      error: error.message
    });
  }
};

// Get order by number (public - for tracking)
export const getOrderByNumberController = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const order = await Order.findOne({ orderNumber })
      .select('orderNumber status createdAt estimatedDelivery actualDelivery trackingNumber statusHistory')
      .populate('items.product', 'name');

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).send({
      success: true,
      message: "Order tracking information",
      order
    });
  } catch (error) {
    console.error("Error fetching order tracking:", error);
    res.status(500).send({
      success: false,
      message: "Error while fetching order tracking",
      error: error.message
    });
  }
};

// Cancel order (user)
export const cancelOrderController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const order = await Order.findOne({ _id: id, user: userId });
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found"
      });
    }

    if (!order.canBeCancelled()) {
      return res.status(400).send({
        success: false,
        message: "Order cannot be cancelled at this stage"
      });
    }

    // Release reserved inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 'inventory.reservedQuantity': -item.quantity }
      });
    }

    order.status = 'cancelled';
    order._updatedBy = userId;
    await order.save();

    res.status(200).send({
      success: true,
      message: "Order cancelled successfully",
      order
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).send({
      success: false,
      message: "Error while cancelling order",
      error: error.message
    });
  }
};

// Get all orders (admin only)
export const getAllOrdersController = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name sku')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.status(200).send({
      success: true,
      message: "Orders fetched successfully",
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).send({
      success: false,
      message: "Error while fetching orders",
      error: error.message
    });
  }
};

// Get recent orders (admin only)
export const getRecentOrdersController = async (req, res) => {
  try {
    const { days = 7, limit = 10 } = req.query;

    const orders = await Order.findRecentOrders(Number(days))
      .populate('user', 'name email')
      .populate('items.product', 'name sku')
      .limit(Number(limit));

    res.status(200).send({
      success: true,
      message: "Recent orders fetched successfully",
      orders
    });
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    res.status(500).send({
      success: false,
      message: "Error while fetching recent orders",
      error: error.message
    });
  }
};

// Update order status (admin only)
export const updateOrderStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, trackingNumber, estimatedDelivery } = req.body;
    const adminId = req.user._id || req.user.id;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found"
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);

    // Handle inventory changes based on status
    if (status && status !== order.status) {
      if (status === 'cancelled' && ['pending', 'confirmed', 'processing'].includes(order.status)) {
        // Release reserved inventory
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { 'inventory.reservedQuantity': -item.quantity }
          });
        }
      } else if (status === 'shipped' && order.status === 'processing') {
        // Convert reserved to sold
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: {
              'inventory.quantity': -item.quantity,
              'inventory.reservedQuantity': -item.quantity,
              'salesCount': item.quantity
            }
          });
        }
      }
    }

    order._updatedBy = adminId;
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email')
     .populate('items.product', 'name sku');

    // Add note to status history if provided
    if (note && updatedOrder.statusHistory.length > 0) {
      const lastEntry = updatedOrder.statusHistory[updatedOrder.statusHistory.length - 1];
      lastEntry.note = note;
      await updatedOrder.save();
    }

    res.status(200).send({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).send({
      success: false,
      message: "Error while updating order status",
      error: error.message
    });
  }
};

// Update order payment status (admin only)
export const updateOrderPaymentController = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentReference } = req.body;

    const updateData = { paymentStatus };
    if (paymentReference) updateData.paymentReference = paymentReference;

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email')
     .populate('items.product', 'name sku');

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).send({
      success: true,
      message: "Order payment status updated successfully",
      order
    });
  } catch (error) {
    console.error("Error updating order payment:", error);
    res.status(500).send({
      success: false,
      message: "Error while updating order payment",
      error: error.message
    });
  }
};

// Add note to order (admin only)
export const addOrderNoteController = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || note.trim().length === 0) {
      return res.status(400).send({
        success: false,
        message: "Note content is required"
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { adminNotes: note.trim() },
      { new: true, runValidators: true }
    ).populate('user', 'name email')
     .populate('items.product', 'name sku');

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).send({
      success: true,
      message: "Order note added successfully",
      order
    });
  } catch (error) {
    console.error("Error adding order note:", error);
    res.status(500).send({
      success: false,
      message: "Error while adding order note",
      error: error.message
    });
  }
};

// Get order statistics (admin only)
export const getOrderStatsController = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    // Revenue statistics
    const revenueStats = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          sku: '$product.sku',
          totalSold: 1,
          totalRevenue: 1
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).send({
      success: true,
      message: "Order statistics fetched successfully",
      stats: {
        orderCounts: {
          total: totalOrders,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        },
        revenue: revenueStats[0] || { totalRevenue: 0, averageOrderValue: 0, totalOrders: 0 },
        recentOrders,
        topProducts
      }
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).send({
      success: false,
      message: "Error while fetching order statistics",
      error: error.message
    });
  }
};
