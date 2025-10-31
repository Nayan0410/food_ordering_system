// controllers/customer_controller.js
import Customer from "../models/customer_model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// helper to create token
const createToken = (id) => {
  return jwt.sign({ id, role: "customer" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// POST /api/customers/signup
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    // check existing
    const existing = await Customer.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // hash
    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);

    const newCustomer = new Customer({
      name,
      email: email.toLowerCase(),
      password: hashed,
      address,
      phone,
    });

    const saved = await newCustomer.save();

    const token = createToken(saved._id);

    // return safe user data (exclude password)
    const { password: _p, ...userSafe } = saved.toObject();

    return res
      .status(201)
      .json({ message: "Customer registered", token, user: userSafe });
  } catch (err) {
    console.error("registerCustomer:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/customers/login
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer)
      return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, customer.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = createToken(customer._id);

    const { password: _p, ...userSafe } = customer.toObject();
    return res
      .status(200)
      .json({ message: "Login successful", token, user: userSafe });
  } catch (err) {
    console.error("loginCustomer:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/customers/profile  (protected)
export const getCustomerProfile = async (req, res) => {
  try {
    const id = req.customerId;
    const customer = await Customer.findById(id).select("-password -__v");
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    return res.status(200).json({ customer });
  } catch (err) {
    console.error("getCustomerProfile:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
