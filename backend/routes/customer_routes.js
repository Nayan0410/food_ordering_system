import express from "express";
import {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  getAllVendors,
  getVendorById,
  getVendorMenu, // ✅ add this
} from "../controllers/customer_controller.js";
import authCustomer from "../middleware/customer_auth.js";

const router = express.Router();

// -----------------------------
// Authentication Routes
// -----------------------------
router.post("/signup", registerCustomer);
router.post("/login", loginCustomer);
router.get("/profile", authCustomer, getCustomerProfile);

// -----------------------------
// Public Browsing Routes
// -----------------------------
router.get("/vendors", getAllVendors); // ✅ Browse all vendors
router.get("/vendor/:vendorId", getVendorById); // ✅ Single vendor details
router.get("/vendor/:vendorId/menu", getVendorMenu); // ✅ Vendor’s menu

export default router;
