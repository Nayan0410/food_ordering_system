// controllers/vendor_controller.js

// --- Imports ---
import Vendor from "../models/vendor_model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// -----------------------------
// @desc    Register a new vendor
// @route   POST /api/vendor/signup
// @access  Public
// -----------------------------
export const registerVendor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      shopName,
      phone,
      address,
      deliveryPrice, // ✅ FIXED: added this
    } = req.body;

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({
      $or: [{ email }, { shopName }],
    });

    if (existingVendor) {
      return res.status(400).json({
        message: "Vendor with this email or shop name already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create vendor
    const newVendor = new Vendor({
      name,
      email,
      password: hashedPassword,
      shopName,
      phone: phone || "",
      address: address || "",
      deliveryPrice: deliveryPrice || 0, // ✅ FIXED
    });

    await newVendor.save();

    // JWT token
    const token = jwt.sign(
      { id: newVendor._id, role: "vendor" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Vendor registered successfully",
      vendor: {
        id: newVendor._id,
        name: newVendor.name,
        email: newVendor.email,
        shopName: newVendor.shopName,
        phone: newVendor.phone,
        address: newVendor.address,
        deliveryPrice: newVendor.deliveryPrice,
      },
      token,
    });
  } catch (error) {
    console.error("Error in registerVendor:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// -----------------------------
// @desc    Login vendor
// @route   POST /api/vendor/login
// @access  Public
// -----------------------------
export const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: vendor._id, role: "vendor" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        shopName: vendor.shopName,
        phone: vendor.phone,
        address: vendor.address,
      },
      token,
    });
  } catch (error) {
    console.error("Error in loginVendor:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

import MenuItem from "../models/menuItem_model.js";

// ================= MENU MANAGEMENT =================

// Add menu item
export const addMenuItem = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
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
    return res.status(201).json({
      message: "Menu item added successfully",
      item: newItem,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add menu item",
      error: error.message,
    });
  }
};

// Get menu items
export const getMenuItems = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const items = await MenuItem.find({ vendor: vendorId });
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch menu items",
      error: error.message,
    });
  }
};

// Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { itemId } = req.params;

    const item = await MenuItem.findOneAndUpdate(
      { _id: itemId, vendor: vendorId },
      req.body,
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    return res.status(200).json({
      message: "Menu item updated successfully",
      item,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update menu item",
      error: error.message,
    });
  }
};

// Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { itemId } = req.params;

    const deletedItem = await MenuItem.findOneAndDelete({
      _id: itemId,
      vendor: vendorId,
    });

    if (!deletedItem) {
      return res.status(404).json({
        message: "Menu item not found or unauthorized",
      });
    }

    return res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete menu item",
      error: error.message,
    });
  }
};

// Update delivery price
export const updateDeliveryPrice = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
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

    return res.status(200).json({
      message: "Delivery price updated successfully",
      deliveryPrice: updatedVendor.deliveryPrice,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update delivery price",
      error: error.message,
    });
  }
};
