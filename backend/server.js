// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Customer from "./models/customer_model.js"; // <-- make sure this file exists
import Vendor from "./models/vendor_model.js";

dotenv.config();

const app = express();
app.use(express.json());

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- Test route to confirm server is working ---
app.get("/", (req, res) => {
  res.send("API is running...");
});

// --- Test route to add a sample customer ---
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

// --- Start the server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// test route to add a sample vendor
app.post("/test-add-vendor", async (req, res) => {
  try {
    const sample = new Vendor({
      shopName: "Foodie Corner",
      ownerName: "Ravi Kumar",
      email: `vendor-${Date.now()}@example.com`,
      phone: "8888888888",
      address: "Jaipur",
      password: "vendor123",
    });

    const saved = await sample.save();
    res.status(201).json({ message: "Vendor saved", id: saved._id });
  } catch (err) {
    console.error("Error saving vendor:", err);
    res.status(500).json({ error: err.message });
  }
});
