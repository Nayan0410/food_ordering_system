// controllers/vendor_controller.js

// --- Imports ---
import Vendor from "../models/vendor_model.js"; // ✅ your model import (goes first)
import bcrypt from "bcrypt"; // for password hashing
import jwt from "jsonwebtoken"; // for generating tokens

// -----------------------------
// @desc    Register a new vendor
// @route   POST /api/vendors/signup
// @access  Public
// -----------------------------
export const registerVendor = async (req, res) => {
  try {
    const { name, email, password, shopName } = req.body;

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({
      $or: [{ email }, { shopName }],
    });

    if (existingVendor) {
      return res.status(400).json({
        message: "Vendor with this email or shop name already exists",
      });
    }

    // Hash password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new vendor
    const newVendor = new Vendor({
      name,
      email,
      password: hashedPassword,
      shopName,
    });

    // Save vendor to DB
    await newVendor.save();

    // Create JWT token
    const token = jwt.sign(
      { id: newVendor._id, role: "vendor" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Vendor registered successfully",
      vendor: {
        id: newVendor._id,
        name: newVendor.name,
        email: newVendor.email,
        shopName: newVendor.shopName,
      },
      token,
    });
  } catch (error) {
    console.error("Error in registerVendor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -----------------------------
// @desc    Login vendor
// @route   POST /api/vendors/login
// @access  Public
// -----------------------------
export const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find vendor by email
    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: vendor._id, role: "vendor" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        shopName: vendor.shopName,
      },
      token,
    });
  } catch (error) {
    console.error("Error in loginVendor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
