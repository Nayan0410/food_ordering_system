// backend/models/vendorModel.js
import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    shopName: { type: String, required: true, unique: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;
