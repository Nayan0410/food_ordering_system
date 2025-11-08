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

    // 1️⃣ Fetch customer details
    const customer = await Customer.findById(customerId);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    // 2️⃣ Fetch customer's cart
    let cart = await Cart.findOne({ customer: customerId }).populate(
      "items.item"
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // 3️⃣ Determine vendor from the first item
    const firstItem = await MenuItem.findById(cart.items[0].item);
    const vendorId = firstItem.vendor;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    // 4️⃣ Calculate subtotal
    let subtotal = 0;
    const orderItems = [];

    for (let cartItem of cart.items) {
      const item = await MenuItem.findById(cartItem.item);

      orderItems.push({
        menuItem: item._id,
        itemName: item.itemName, // ✅ snapshot
        price: item.price, // ✅ snapshot
        quantity: cartItem.quantity,
      });

      subtotal += item.price * cartItem.quantity;
    }

    // 5️⃣ Delivery price
    const deliveryPrice = vendor.deliveryPrice || 0;

    // 6️⃣ Final total
    const totalAmount = subtotal + deliveryPrice;

    // 7️⃣ Create the order
    const newOrder = await Order.create({
      customer: customerId,
      customerName: customer.name,
      customerPhone: customer.phone,
      deliveryAddress: customer.address,

      vendor: vendorId,

      items: orderItems,
      subtotal,
      deliveryPrice,
      totalAmount,

      orderStatus: "Pending",
      paymentMethod: "COD",
    });

    // 8️⃣ Clear the cart automatically
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error placing order", error: error.message });
  }
};

// --------------------------------------------------
// ✅ GET ALL ORDERS OF A CUSTOMER
// --------------------------------------------------
export const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.customerId;

    const orders = await Order.find({ customer: customerId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ orders });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
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
      customer: customerId, // ensure customer can only view their own orders
    }).populate("vendor", "shopName address phone");

    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.status(200).json({ order });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching order", error: error.message });
  }
};
