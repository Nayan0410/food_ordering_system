import Cart from "../models/cart_model.js";
import MenuItem from "../models/menuItem_model.js";

// ✅ Helper to fetch or create cart
const getOrCreateCart = async (customerId) => {
  let cart = await Cart.findOne({ customer: customerId });
  if (!cart) {
    cart = await Cart.create({ customer: customerId, items: [] });
  }
  return cart;
};

// --------------------------------------------------
// ✅ Add Item to Cart (single vendor enforced)
// --------------------------------------------------
export const addItemToCart = async (req, res) => {
  try {
    const customerId = req.customerId;
    const { itemId, quantity } = req.body;

    if (!itemId) return res.status(400).json({ message: "itemId is required" });
    if (!quantity || quantity < 1)
      return res.status(400).json({ message: "Quantity must be at least 1" });

    const item = await MenuItem.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (!item.available)
      return res.status(400).json({ message: "Item is not available" });

    let cart = await getOrCreateCart(customerId);

    // ✅ Single vendor rule
    if (cart.items.length > 0) {
      const existingItem = await MenuItem.findById(cart.items[0].item);

      if (existingItem.vendor.toString() !== item.vendor.toString()) {
        return res.status(400).json({
          message: "You can add items from only one vendor at a time.",
        });
      }
    }

    // ✅ Add or increase quantity
    const existing = cart.items.find((i) => i.item.toString() === itemId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ item: itemId, quantity });
    }

    await cart.save();
    await cart.populate("items.item");

    return res.status(200).json({
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// --------------------------------------------------
// ✅ Remove Item
// --------------------------------------------------
export const removeItemFromCart = async (req, res) => {
  try {
    const customerId = req.customerId;
    const { itemId } = req.body;

    if (!itemId) return res.status(400).json({ message: "itemId is required" });

    const cart = await Cart.findOne({ customer: customerId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((i) => i.item.toString() !== itemId);

    await cart.save();
    await cart.populate("items.item");

    return res.status(200).json({ message: "Item removed", cart });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error removing item", error: error.message });
  }
};

// --------------------------------------------------
// ✅ Update Quantity
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

    return res.status(200).json({
      message: "Quantity updated",
      cart,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating quantity", error: error.message });
  }
};

// --------------------------------------------------
// ✅ Get Cart
// --------------------------------------------------
export const getCustomerCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.customerId);
    await cart.populate("items.item");

    const subtotal = cart.items.reduce(
      (sum, i) => sum + i.item.price * i.quantity,
      0
    );

    return res.status(200).json({
      cart,
      summary: {
        itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
        distinctItems: cart.items.length,
        subtotal,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching cart", error: error.message });
  }
};

// --------------------------------------------------
// ✅ Clear Cart
// --------------------------------------------------
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.customerId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    await cart.save();
    await cart.populate("items.item");

    return res.status(200).json({ message: "Cart cleared", cart });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error clearing cart", error: error.message });
  }
};
