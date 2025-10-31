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

// ---------- Vendor Auth ----------
router.post("/signup", registerVendor);
router.post("/login", loginVendor);

// ---------- Vendor Menu Management ----------
router.post("/menu", verifyVendorJWT, addMenuItem); // Add new item
router.get("/menu", verifyVendorJWT, getMenuItems); // View all items
router.put("/menu/:itemId", verifyVendorJWT, updateMenuItem); // Edit item
router.delete("/menu/:itemId", verifyVendorJWT, deleteMenuItem); // Delete item
router.put("/update-delivery-price", verifyVendorJWT, updateDeliveryPrice);

export default router;
