import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  shopName: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  deliveryPrice: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;
