import mongoose from "mongoose";

// Schema for each item inside the cart
const cartItemSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false } // prevents Mongoose from creating a separate _id for each item
);

// Main cart schema
const cartSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true, // ensure 1 cart per customer
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Model export
const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
