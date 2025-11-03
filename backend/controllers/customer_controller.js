// controllers/customer_controller.js
import Customer from "../models/customer_model.js";
import Vendor from "../models/vendor_model.js"; // ✅ Added
import MenuItem from "../models/menuItem_model.js"; // ✅ Added
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// -----------------------------
// Helper to create token
// -----------------------------
const createToken = (id) => {
  return jwt.sign({ id, role: "customer" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// -----------------------------
// @desc    Register new customer
// @route   POST /api/customers/signup
// @access  Public
// -----------------------------
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

// -----------------------------
// @desc    Login customer
// @route   POST /api/customers/login
// @access  Public
// -----------------------------
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

// -----------------------------
// @desc    Get customer profile
// @route   GET /api/customers/profile
// @access  Protected
// -----------------------------
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

// ===================================================================
// 🔥 NEW SECTION: Browse Vendors & Menus (Public)
// ===================================================================

// -----------------------------
// @desc    Get all vendors
// @route   GET /api/customers/vendors
// @access  Public
// -----------------------------
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({}, "-password -email").sort({
      createdAt: -1,
    });
    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Server error while fetching vendors" });
  }
};

// -----------------------------
// @desc    Get single vendor details + menu
// @route   GET /api/customers/vendor/:vendorId
// @access  Public
// -----------------------------
export const getVendorById = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId, "-password -email");
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const menuItems = await MenuItem.find({
      vendor: vendorId,
      available: true,
    });

    res.status(200).json({ vendor, menuItems });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching vendor details" });
  }
};

export const getVendorMenu = async (req, res) => {
  try {
    const { vendorId } = req.params;

    // Check if vendor exists
    const vendor = await Vendor.findById(vendorId).select(
      "shopName address deliveryPrice"
    );
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Find all menu items for this vendor
    const menuItems = await MenuItem.find({ vendor: vendorId });

    return res.status(200).json({
      vendor,
      menu: menuItems,
    });
  } catch (err) {
    console.error("getVendorMenu:", err);
    res.status(500).json({ message: "Server error" });
  }
};
