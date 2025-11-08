import express from "express";
import { verifyVendorJWT } from "../middleware/vendor_auth.js";

import {
  getVendorOrders,
  getSingleVendorOrder,
  updateOrderStatus,
} from "../controllers/vendor_order_controller.js";

const router = express.Router();

// ✅ All vendor order routes require vendor login
router.use(verifyVendorJWT);

// ✅ Get all orders for this vendor
router.get("/orders", getVendorOrders);

// ✅ Get single order details
router.get("/orders/:orderId", getSingleVendorOrder);

// ✅ Update order status
router.patch("/orders/:orderId/status", updateOrderStatus);

export default router;
