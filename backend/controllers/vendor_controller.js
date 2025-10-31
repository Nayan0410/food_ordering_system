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
      deliveryPrice: deliveryPrice || 0,
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
        deliveryPrice: newVendor.deliveryPrice,
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

import MenuItem from "../models/menuItem_model.js";

// ================= MENU MANAGEMENT =================

// 1️⃣ Add new menu item
export const addMenuItem = async (req, res) => {
  try {
    const vendorId = req.vendor.id; // from JWT middleware
    const { itemName, description, price, category, available, image } =
      req.body;

    const newItem = new MenuItem({
      vendor: vendorId,
      itemName,
      description,
      price,
      category,
      available,
      image,
    });

    await newItem.save();
    res
      .status(201)
      .json({ message: "Menu item added successfully", item: newItem });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add menu item", error: error.message });
  }
};

// 2️⃣ View all menu items (for a specific vendor)
export const getMenuItems = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const items = await MenuItem.find({ vendor: vendorId });
    res.status(200).json(items);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch menu items", error: error.message });
  }
};

// 3️⃣ Edit a menu item
export const updateMenuItem = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { itemId } = req.params;

    const item = await MenuItem.findOneAndUpdate(
      { _id: itemId, vendor: vendorId },
      req.body,
      { new: true }
    );

    if (!item) return res.status(404).json({ message: "Menu item not found" });

    res.status(200).json({ message: "Menu item updated successfully", item });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update menu item", error: error.message });
  }
};

// 4️⃣ Delete a menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { itemId } = req.params;

    const deletedItem = await MenuItem.findOneAndDelete({
      _id: itemId,
      vendor: vendorId,
    });

    if (!deletedItem)
      return res
        .status(404)
        .json({ message: "Menu item not found or unauthorized" });

    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete menu item", error: error.message });
  }
};

// -----------------------------
// @desc    Update vendor delivery price
// @route   PUT /api/vendors/update-delivery-price
// @access  Private (Vendor only)
// -----------------------------
export const updateDeliveryPrice = async (req, res) => {
  try {
    const vendorId = req.vendor.id; // from JWT middleware
    const { deliveryPrice } = req.body;

    if (deliveryPrice == null) {
      return res.status(400).json({ message: "Delivery price is required" });
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { deliveryPrice },
      { new: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({
      message: "Delivery price updated successfully",
      deliveryPrice: updatedVendor.deliveryPrice,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to update delivery price",
        error: error.message,
      });
  }
};
