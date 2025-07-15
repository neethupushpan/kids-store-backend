const Order = require('../models/orderModel');
const Product = require('../models/productModel');

exports.createOrder = async (req, res) => {
  try {
    console.log("📦 Order API hit");
    const { items, totalAmount, paymentInfo, shippingAddress } = req.body;

    if (!items || !totalAmount || !shippingAddress) {
      return res.status(400).json({ error: "Missing required order fields" });
    }

    // 1. Fetch full product info for each item
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product || !product.sellerId) {
          throw new Error("Invalid product or missing seller");
        }
        return {
          product: product._id,
          quantity: item.quantity,
          seller: product.sellerId,
          price: product.price,
        };
      })
    );

    // 2. Group items by seller
    const itemsBySeller = {};
    enrichedItems.forEach((item) => {
      const sellerId = item.seller.toString();
      if (!itemsBySeller[sellerId]) {
        itemsBySeller[sellerId] = [];
      }
      itemsBySeller[sellerId].push(item);
    });

    // 3. Create one order per seller
    const orderIds = [];

    for (const sellerId in itemsBySeller) {
      const sellerItems = itemsBySeller[sellerId];
      const sellerTotal = sellerItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

      const order = new Order({
        user: req.user._id,
        seller: sellerId, // ✅ This makes seller filtering work
        items: sellerItems,
        totalAmount: sellerTotal,
        paymentInfo,
        shippingAddress,
        orderStatus: "Paid",
      });

      await order.save();
      orderIds.push(order._id);
    }

    console.log("✅ Orders saved:", orderIds);
    res.status(201).json({ message: "Orders placed successfully", orderIds });

  } catch (error) {
    console.error("❌ Error saving order:", error);
    res.status(500).json({ error: error.message || "Failed to save order" });
  }
};



// Get Orders for Logged-in User
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('items.product');
    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Failed to fetch user orders:", err.message);
    res.status(500).json({ error: 'Server error while fetching orders' });
  }
};

// Get All Orders - Admin / Seller
// controllers/orderController.js
exports.getAllOrders = async (req, res) => {
  try {
    const { status, customer, date } = req.query;

    let query = {};

    if (status && status.trim() !== '') {
      query.orderStatus = status;
    }

    if (customer && customer.trim() !== '') {
      query["shippingInfo.name"] = { $regex: customer, $options: "i" };
    }

    if (date && date.trim() !== '') {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate)) {
        const nextDay = new Date(parsedDate);
        nextDay.setDate(parsedDate.getDate() + 1);
        query.createdAt = { $gte: parsedDate, $lt: nextDay };
      }
    }

    const orders = await Order.find(query).populate("user", "name email");

    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ getAllOrders Error:", error.message);
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};



exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // If seller, ensure this is their order
    if (req.user.role === 'seller' && order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own orders" });
    }

    // Update status
    order.orderStatus = status;
    if (status === "Delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    console.error("❌ Update order status error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const orders = await Order.find({ "items.seller": sellerId }) // ✅ important fix
      .populate("user", "name email")
      .populate("items.product", "title");

    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ getSellerOrders Error:", error.message);
    res.status(500).json({ message: "Failed to fetch seller orders" });
  }
};

exports. getUserOrdersById = async (req, res) => {
  try {
    const userId = req.params.userId;

    const orders = await Order.find({ user: userId }).populate("products.product");

    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error fetching user orders by ID:", error);
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
};


