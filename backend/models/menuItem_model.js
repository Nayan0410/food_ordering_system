// backend/models/menuItemModel.js
import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor", // links menu item to the vendor who added it
      required: true,
    },
    itemName: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true }, // e.g. 'Snacks', 'Beverages'
    available: { type: Boolean, default: true },
    image: { type: String }, // optional - can store image URL later
  },
  { timestamps: true }
);

const MenuItem = mongoose.model("MenuItem", menuItemSchema);
export default MenuItem;
