import Order from "../models/order_model.js";

// --------------------------------------------------
// ✅ GET ALL ORDERS OF A VENDOR
// --------------------------------------------------
export const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.vendor.id;

    const orders = await Order.find({ vendor: vendorId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching vendor orders",
      error: error.message,
    });
  }
};

// --------------------------------------------------
// ✅ GET SINGLE ORDER DETAILS FOR VENDOR
// --------------------------------------------------
export const getSingleVendorOrder = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      vendor: vendorId, // ensure vendor accesses only OWN orders
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ order });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching order",
      error: error.message,
    });
  }
};

// --------------------------------------------------
// ✅ UPDATE ORDER STATUS (Step-by-step only)
// --------------------------------------------------
export const updateOrderStatus = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { orderId } = req.params;
    const { newStatus } = req.body;

    const allowedStatuses = [
      "Pending",
      "Preparing",
      "Out for Delivery",
      "Delivered",
    ];

    if (!allowedStatuses.includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    const order = await Order.findOne({
      _id: orderId,
      vendor: vendorId,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Step-by-step validation
    const current = order.orderStatus;
    const nextStep = {
      Pending: "Preparing",
      Preparing: "Out for Delivery",
      "Out for Delivery": "Delivered",
    };

    if (nextStep[current] !== newStatus) {
      return res.status(400).json({
        message: `Invalid status transition. You can only move from ${current} → ${nextStep[current]}.`,
      });
    }

    // ✅ Update the status
    order.orderStatus = newStatus;
    await order.save();

    return res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating order status",
      error: error.message,
    });
  }
};
