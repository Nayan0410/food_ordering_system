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

// Auth
router.post("/signup", registerVendor);
router.post("/login", loginVendor);

// Vendor profile (basic)
router.get("/profile", verifyVendorJWT, (req, res) => {
  res.status(200).json({ vendor: req.vendor });
});

// Menu management
router.post("/menu", verifyVendorJWT, addMenuItem);
router.get("/menu", verifyVendorJWT, getMenuItems);
router.put("/menu/:itemId", verifyVendorJWT, updateMenuItem);
router.delete("/menu/:itemId", verifyVendorJWT, deleteMenuItem);

// Update delivery price
router.put("/update-delivery-price", verifyVendorJWT, updateDeliveryPrice);

export default router;
