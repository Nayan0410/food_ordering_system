import express from "express";
import {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
} from "../controllers/customer_controller.js";
import authCustomer from "../middleware/customer_auth.js";

const router = express.Router();

router.post("/signup", registerCustomer);
router.post("/login", loginCustomer);
router.get("/profile", authCustomer, getCustomerProfile);

export default router;
