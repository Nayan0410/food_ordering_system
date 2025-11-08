import express from "express";
import authCustomer from "../middleware/customer_auth.js";

import {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  getCustomerCart,
  clearCart,
} from "../controllers/cart_controller.js";

const router = express.Router();

// ✅ All cart routes require customer login
router.use(authCustomer);

// ✅ Add item to cart
router.post("/add", addItemToCart);

// ✅ Get cart
router.get("/", getCustomerCart);

// ✅ Remove item from cart
router.post("/remove", removeItemFromCart);

// ✅ Update quantity
router.post("/update", updateCartItemQuantity);

// ✅ Clear cart
router.post("/clear", clearCart);

export default router;
