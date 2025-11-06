// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

// --- Import Models ---
import Customer from "./models/customer_model.js";
import Vendor from "./models/vendor_model.js";
import MenuItem from "./models/menuItem_model.js";
import Order from "./models/order_model.js";

// --- Import Routes ---
import vendorRoutes from "./routes/vendor_routes.js";
import customerRoutes from "./routes/customer_routes.js";
import cartRoutes from "./routes/cart_routes.js"; // ✅ Added

dotenv.config();

const app = express();
app.use(express.json());

// -------------------------
// ✅ MongoDB Connection
// -------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// -------------------------
// ✅ Basic Test Route
// -------------------------
app.get("/", (req, res) => {
  res.send("🍴 Local Food Ordering System API is running...");
});

// -------------------------
// ✅ Vendor Authentication + Menu Management Routes
// -------------------------
app.use("/api/vendor", vendorRoutes); // ✅ (singular) matches your controller routes

// -------------------------
// ✅ Customer Authentication
// -------------------------
app.use("/api/customers", customerRoutes);

// -------------------------
// ✅ Cart Routes (Protected)
// -------------------------
app.use("/api/cart", cartRoutes); // ✅ Added

// -------------------------
// ✅ Test Routes (for temporary manual checks)
// -------------------------

// 1️⃣ Add a sample customer
app.post("/test-add-customer", async (req, res) => {
  try {
    const sample = new Customer({
      name: "Test Customer",
      email: `test-${Date.now()}@example.com`,
      phone: "9999999999",
      address: "Test Address",
      password: "temp1234",
    });

    const saved = await sample.save();
    res.status(201).json({ message: "Customer saved", id: saved._id });
  } catch (err) {
    console.error("Error saving customer:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2️⃣ Add a sample vendor
app.post("/test-add-vendor", async (req, res) => {
  try {
    const sample = new Vendor({
      name: "Sneha Sharma",
      email: `tastytreats-${Date.now()}@example.com`,
      password: "temp1234",
      shopName: "Tasty Treats",
      phone: "9999999999",
      address: "Pune",
      deliveryPrice: 40,
    });

    const saved = await sample.save();
    res.status(201).json({ message: "Vendor saved", id: saved._id });
  } catch (err) {
    console.error("Error saving vendor:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3️⃣ Add a sample menu item
app.post("/test-add-menu", async (req, res) => {
  try {
    const sample = new MenuItem({
      vendor: "6722d9b2f9f8b5a0c1234567", // replace with actual Vendor _id
      itemName: "Veg Burger",
      description: "Crispy veg patty with lettuce and mayo",
      price: 120,
      category: "Snacks",
      available: true,
      image: "https://example.com/veg-burger.jpg",
    });

    const saved = await sample.save();
    res.status(201).json({ message: "Menu item saved", id: saved._id });
  } catch (err) {
    console.error("Error saving menu item:", err);
    res.status(500).json({ error: err.message });
  }
});

// 4️⃣ Add a sample order
app.post("/test-add-order", async (req, res) => {
  try {
    const sample = new Order({
      customer: "6722d9b2f9f8b5a0c1234567", // replace later with real IDs
      vendor: "6722d9b2f9f8b5a0c1234568",
      items: [
        { menuItem: "6722d9b2f9f8b5a0c1234569", quantity: 2 },
        { menuItem: "6722d9b2f9f8b5a0c1234570", quantity: 1 },
      ],
      totalAmount: 360,
      deliveryAddress: "123 MG Road, Jaipur",
      orderStatus: "Pending",
      paymentMethod: "COD",
    });

    const saved = await sample.save();
    res.status(201).json({ message: "Order saved", id: saved._id });
  } catch (err) {
    console.error("Error saving order:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------
// ✅ Start Server
// -------------------------
const PORT = process.env.SERVER_PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
