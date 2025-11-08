import express from "express";
import authCustomer from "../middleware/customer_auth.js";

import {
  placeOrder,
  getCustomerOrders,
  getSingleOrder,
} from "../controllers/order_controller.js";

const router = express.Router();

// ✅ All order routes require customer login
router.use(authCustomer);

// ✅ Place a new order
router.post("/place", placeOrder);

// ✅ Get all orders of the logged-in customer
router.get("/my-orders", getCustomerOrders);

// ✅ Get single order details
router.get("/order/:orderId", getSingleOrder);

export default router;
