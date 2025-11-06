import Cart from "../models/cart_model.js";
import MenuItem from "../models/menuItem_model.js";

// ✅ Helper — fetch or create a cart for the customer
const getOrCreateCart = async (customerId) => {
  let cart = await Cart.findOne({ customer: customerId });
  if (!cart) {
    cart = await Cart.create({ customer: customerId, items: [] });
  }
  return cart;
};

// --------------------------------------------------
// ✅ Add Item to Cart (with single-vendor enforcement)
// --------------------------------------------------
export const addItemToCart = async (req, res) => {
  try {
    const customerId = req.customerId;
    const { itemId, quantity } = req.body;

    // Basic validation
    if (!itemId) return res.status(400).json({ message: "itemId is required" });
    if (!quantity || quantity < 1)
      return res.status(400).json({ message: "Quantity must be at least 1" });

    // Check if item exists
    const item = await MenuItem.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Get or create cart
    let cart = await getOrCreateCart(customerId);

    // ✅ Enforce one-vendor-per-cart rule
    if (cart.items.length > 0) {
      const existingItem = await MenuItem.findById(cart.items[0].item);
      const existingVendorId = existingItem.vendor.toString();
      const newVendorId = item.vendor.toString();

      if (existingVendorId !== newVendorId) {
        return res.status(400).json({
          message: "You can add items from only one vendor at a time.",
        });
      }
    }

    // Add / Update quantity logic
    const existing = cart.items.find((i) => i.item.toString() === itemId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ item: itemId, quantity });
    }

    await cart.save();
    await cart.populate("items.item");

    res.status(200).json({
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --------------------------------------------------
// ✅ Remove Item From Cart
// --------------------------------------------------
export const removeItemFromCart = async (req, res) => {
  try {
    const customerId = req.customerId;
    const { itemId } = req.body;

    if (!itemId) return res.status(400).json({ message: "itemId is required" });

    const cart = await Cart.findOne({ customer: customerId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const newItems = cart.items.filter((i) => i.item.toString() !== itemId);
    cart.items = newItems;

    await cart.save();
    await cart.populate("items.item");

    res.status(200).json({ message: "Item removed", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing item", error: error.message });
  }
};

// --------------------------------------------------
// ✅ Update Item Quantity
// --------------------------------------------------
export const updateCartItemQuantity = async (req, res) => {
  try {
    const customerId = req.customerId;
    const { itemId, quantity } = req.body;

    if (!itemId) return res.status(400).json({ message: "itemId is required" });
    if (!quantity || quantity < 1)
      return res.status(400).json({ message: "Quantity must be at least 1" });

    const cart = await Cart.findOne({ customer: customerId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const existing = cart.items.find((i) => i.item.toString() === itemId);
    if (!existing)
      return res.status(404).json({ message: "Item not found in cart" });

    existing.quantity = quantity;

    await cart.save();
    await cart.populate("items.item");

    res.status(200).json({ message: "Quantity updated", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating quantity", error: error.message });
  }
};

// --------------------------------------------------
// ✅ Get Customer Cart
// --------------------------------------------------
export const getCustomerCart = async (req, res) => {
  try {
    const customerId = req.customerId;

    const cart = await getOrCreateCart(customerId);
    await cart.populate("items.item");

    // Calculate subtotal
    const subtotal = cart.items.reduce((sum, i) => {
      return sum + i.item.price * i.quantity;
    }, 0);

    res.status(200).json({
      cart,
      summary: {
        itemCount: cart.items.reduce((n, i) => n + i.quantity, 0),
        distinctItems: cart.items.length,
        subtotal,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cart", error: error.message });
  }
};

// --------------------------------------------------
// ✅ Clear Cart
// --------------------------------------------------
export const clearCart = async (req, res) => {
  try {
    const customerId = req.customerId;

    const cart = await Cart.findOne({ customer: customerId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    await cart.save();

    res.status(200).json({ message: "Cart cleared", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error clearing cart", error: error.message });
  }
};
