import Vendor from "../models/vendor_model.js";
import MenuItem from "../models/menuItem_model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Register a new vendor
export const registerVendor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      shopName,
      phone,
      address,
      deliveryPrice,
      logo,
    } = req.body;

    if (!name || !email || !password || !shopName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingVendor = await Vendor.findOne({
      $or: [{ email: normalizedEmail }, { shopName }],
    });

    if (existingVendor) {
      return res.status(400).json({
        message: "Vendor with this email or shop name already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const newVendor = new Vendor({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      shopName: shopName.trim(),
      phone: phone || "",
      address: address || "",
      deliveryPrice: deliveryPrice || 0,
      logo: logo || "",
    });

    await newVendor.save();

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
        phone: newVendor.phone,
        address: newVendor.address,
        deliveryPrice: newVendor.deliveryPrice,
        logo: newVendor.logo,
      },
      token,
    });
  } catch (err) {
    console.error("registerVendor:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login vendor
export const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const vendor = await Vendor.findOne({ email: normalizedEmail });

    if (!vendor) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, vendor.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

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
        phone: vendor.phone,
        address: vendor.address,
        logo: vendor.logo,
      },
      token,
    });
  } catch (err) {
    console.error("loginVendor:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add menu item
export const addMenuItem = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { itemName, description, price, category, available, image } =
      req.body;

    if (!itemName || !price || !category) {
      return res.status(400).json({
        message: "Item name, price, and category are required",
      });
    }

    const newItem = new MenuItem({
      vendor: vendorId,
      itemName: itemName.trim(),
      description: description || "",
      price,
      category: category.trim(),
      available: available ?? true,
      image: image || "",
    });

    await newItem.save();

    res.status(201).json({
      message: "Menu item added successfully",
      item: newItem,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to add menu item",
      error: err.message,
    });
  }
};

// Get all menu items
export const getMenuItems = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const items = await MenuItem.find({ vendor: vendorId });

    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch menu items",
      error: err.message,
    });
  }
};

// Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { itemId } = req.params;

    const allowedFields = [
      "itemName",
      "description",
      "price",
      "category",
      "available",
      "image",
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const item = await MenuItem.findOneAndUpdate(
      { _id: itemId, vendor: vendorId },
      updateData,
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.status(200).json({
      message: "Menu item updated successfully",
      item,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update menu item",
      error: err.message,
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
      return res
        .status(404)
        .json({ message: "Menu item not found or unauthorized" });
    }

    res.status(200).json({
      message: "Menu item deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete menu item",
      error: err.message,
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

    res.status(200).json({
      message: "Delivery price updated successfully",
      deliveryPrice: updatedVendor.deliveryPrice,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update delivery price",
      error: err.message,
    });
  }
};
