// controllers/customer_controller.js

import Customer from "../models/customer_model.js";
import Vendor from "../models/vendor_model.js";
import MenuItem from "../models/menuItem_model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Helper to create token
const createToken = (id) => {
  return jwt.sign({ id, role: "customer" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// -----------------------------
// ✅ Register new customer
// -----------------------------
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;

    if (!name || !email || !password || !address || !phone) {
      return res.status(400).json({
        message: "Name, email, password, phone, and address are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await Customer.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newCustomer = new Customer({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      address: address.trim(),
      phone: phone.trim(),
    });

    const saved = await newCustomer.save();
    const token = createToken(saved._id);

    const { password: _p, ...userSafe } = saved.toObject();

    return res.status(201).json({
      message: "Customer registered",
      token,
      user: userSafe,
    });
  } catch (err) {
    console.error("registerCustomer:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------
// ✅ Login customer
// -----------------------------
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const customer = await Customer.findOne({ email: normalizedEmail });
    if (!customer) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, customer.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken(customer._id);
    const { password: _p, ...userSafe } = customer.toObject();

    return res.status(200).json({
      message: "Login successful",
      token,
      user: userSafe,
    });
  } catch (err) {
    console.error("loginCustomer:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------
// ✅ Get customer profile
// -----------------------------
export const getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customerId).select(
      "-password -__v"
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.status(200).json({ customer });
  } catch (err) {
    console.error("getCustomerProfile:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===================================================================
// ✅ Browse Vendors & Menus (Public)
// ===================================================================

// ✅ Get all vendors
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({}, "-password -email").sort({
      createdAt: -1,
    });

    return res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching vendors" });
  }
};

// ✅ Get vendor details + available menu
export const getVendorById = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId).select(
      "shopName address deliveryPrice logo"
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const menuItems = await MenuItem.find({
      vendor: vendorId,
      available: true,
    });

    return res.status(200).json({ vendor, menuItems });
  } catch (error) {
    console.error("getVendorById:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching vendor details" });
  }
};

// ✅ Get vendor menu only
export const getVendorMenu = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId).select(
      "shopName address deliveryPrice logo"
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const menuItems = await MenuItem.find({ vendor: vendorId });

    return res.status(200).json({
      vendor,
      menu: menuItems,
    });
  } catch (err) {
    console.error("getVendorMenu:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
