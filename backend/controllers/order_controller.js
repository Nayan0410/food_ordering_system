import Cart from "../models/cart_model.js";
import Order from "../models/order_model.js";
import Customer from "../models/customer_model.js";
import Vendor from "../models/vendor_model.js";
import MenuItem from "../models/menuItem_model.js";

// --------------------------------------------------
// ✅ PLACE ORDER
// --------------------------------------------------
export const placeOrder = async (req, res) => {
  try {
    const customerId = req.customerId;

    // 1️⃣ Fetch customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // 2️⃣ Fetch cart with populated items
    const cart = await Cart.findOne({ customer: customerId }).populate(
      "items.item"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // 3️⃣ Vendor from first item
    const firstItemVendor = cart.items[0].item.vendor;
    const vendor = await Vendor.findById(firstItemVendor);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // 4️⃣ Build order items + calculate subtotal
    let subtotal = 0;
    const orderItems = cart.items.map((cartItem) => {
      const item = cartItem.item;
      subtotal += item.price * cartItem.quantity;

      return {
        menuItem: item._id,
        itemName: item.itemName, // snapshot
        price: item.price, // snapshot
        quantity: cartItem.quantity,
      };
    });

    // 5️⃣ Delivery charge
    const deliveryPrice = vendor.deliveryPrice || 0;

    // 6️⃣ Total
    const totalAmount = subtotal + deliveryPrice;

    // 7️⃣ Create order
    const newOrder = await Order.create({
      customer: customerId,
      customerName: customer.name,
      customerPhone: customer.phone,
      deliveryAddress: customer.address,

      vendor: vendor._id,

      items: orderItems,
      subtotal,
      deliveryPrice,
      totalAmount,

      paymentMethod: "COD",
      orderStatus: "Pending",
    });

    // 8️⃣ Clear cart
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error placing order",
      error: error.message,
    });
  }
};

// --------------------------------------------------
// ✅ GET ALL ORDERS FOR A CUSTOMER
// --------------------------------------------------
export const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.customerId;

    const orders = await Order.find({ customer: customerId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// --------------------------------------------------
// ✅ GET SINGLE ORDER DETAILS
// --------------------------------------------------
export const getSingleOrder = async (req, res) => {
  try {
    const customerId = req.customerId;
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      customer: customerId,
    }).populate("vendor", "shopName address phone logo");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ order });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching order",
      error: error.message,
    });
  }
};
