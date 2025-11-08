// backend/models/orderModel.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // -------------------------
    // Customer Information
    // -------------------------
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    customerName: { type: String, required: true }, // ✅ Added
    customerPhone: { type: String, required: true }, // ✅ Added

    // -------------------------
    // Vendor Information
    // -------------------------
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    // -------------------------
    // Order Items (Snapshot)
    // -------------------------
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        itemName: { type: String, required: true }, // ✅ Snapshot for safety
        price: { type: Number, required: true }, // ✅ Snapshot of price
        quantity: { type: Number, required: true, min: 1 },
      },
    ],

    // -------------------------
    // Pricing
    // -------------------------
    subtotal: { type: Number, required: true }, // ✅ Added
    deliveryPrice: { type: Number, required: true }, // ✅ Added
    totalAmount: { type: Number, required: true },

    // -------------------------
    // Delivery Address
    // -------------------------
    deliveryAddress: { type: String, required: true },

    // -------------------------
    // Order Status + Payment
    // -------------------------
    orderStatus: {
      type: String,
      enum: ["Pending", "Preparing", "Out for Delivery", "Delivered"],
      default: "Pending",
    },

    paymentMethod: {
      type: String,
      enum: ["COD"], // only Cash on Delivery for now
      default: "COD",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
