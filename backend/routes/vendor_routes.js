// routes/vendor_routes.js

const express = require("express");
const router = express.Router();
const {
  registerVendor,
  loginVendor,
} = require("../controllers/vendor_controller");

// Route for Vendor Signup
router.post("/signup", registerVendor);

// Route for Vendor Login
router.post("/login", loginVendor);

module.exports = router;
