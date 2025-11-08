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

    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },

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
        _id: false, // ✅ no need for subdocument _id
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        itemName: { type: String, required: true, trim: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],

    // -------------------------
    // Pricing
    // -------------------------
    subtotal: { type: Number, required: true },
    deliveryPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    // -------------------------
    // Delivery Address
    // -------------------------
    deliveryAddress: { type: String, required: true, trim: true },

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
      enum: ["COD"],
      default: "COD",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
