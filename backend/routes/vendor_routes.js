// routes/vendor_routes.js
import express from "express";
import {
  registerVendor,
  loginVendor,
  addMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem,
  updateDeliveryPrice,
} from "../controllers/vendor_controller.js";
import { verifyVendorJWT } from "../middleware/vendor_auth.js";

const router = express.Router();

// -----------------------------
// ✅ Vendor Authentication
// -----------------------------
router.post("/signup", registerVendor);
router.post("/login", loginVendor);

// -----------------------------
// ✅ Vendor Profile (optional but recommended)
// -----------------------------
router.get("/profile", verifyVendorJWT, (req, res) => {
  res.status(200).json({ vendor: req.vendor });
});

// -----------------------------
// ✅ Menu Management
// -----------------------------
router.post("/menu", verifyVendorJWT, addMenuItem);
router.get("/menu", verifyVendorJWT, getMenuItems);
router.put("/menu/:itemId", verifyVendorJWT, updateMenuItem);
router.delete("/menu/:itemId", verifyVendorJWT, deleteMenuItem);

// -----------------------------
// ✅ Update Delivery Price
// -----------------------------
router.put("/update-delivery-price", verifyVendorJWT, updateDeliveryPrice);

export default router;
