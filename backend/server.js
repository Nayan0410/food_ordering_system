// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

// --- Import Models (optional if not used directly) ---
import Customer from "./models/customer_model.js";
import Vendor from "./models/vendor_model.js";
import MenuItem from "./models/menuItem_model.js";
import Order from "./models/order_model.js";

// --- Import Routes ---
import vendorRoutes from "./routes/vendor_routes.js";
import customerRoutes from "./routes/customer_routes.js";
import cartRoutes from "./routes/cart_routes.js";
import orderRoutes from "./routes/order_routes.js";
import vendorOrderRoutes from "./routes/vendor_order_routes.js";

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
// ✅ Vendor Auth + Vendor Features
// -------------------------
app.use("/api/vendor", vendorRoutes);

// -------------------------
// ✅ Vendor Order Routes
// -------------------------
app.use("/api/vendor", vendorOrderRoutes);

// -------------------------
// ✅ Customer Authentication
// -------------------------
app.use("/api/customers", customerRoutes);

// -------------------------
// ✅ Customer Cart Routes
// -------------------------
app.use("/api/cart", cartRoutes);

// -------------------------
// ✅ Customer Order Routes
// -------------------------
app.use("/api/order", orderRoutes);

// -------------------------
// ✅ Start Server
// -------------------------
const PORT = process.env.SERVER_PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
