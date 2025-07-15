const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// GET /api/cart


const getCart = async (req, res) => {
  const userId = req.params.userId;

  try {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) {
      return res.status(200).json({ cartItems: [], total: 0 });
    }

    // Calculate total price
    const totalPrice = cart.items.reduce((sum, item) => {
      const productPrice = item.product?.price || 0;
      return sum + productPrice * item.quantity;
    }, 0);

    res.status(200).json({
      cartItems: cart.items,
      totalPrice,
    });
  } catch (error) {
    console.error("❌ Error in getCart:", error);
    res.status(500).json({ message: 'Server Error', error });
  }
};


// POST /api/cart
const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(item => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    // Recalculate totalPrice
    await cart.populate('items.product');
    cart.totalPrice = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    await cart.save();

    res.status(201).json({
      message: "Item added to cart",
      cartItems: cart.items,
      totalPrice: cart.totalPrice,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add to cart", error });
  }
};

// PATCH /api/cart/:productId
const updateCartItem = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Product not in cart' });

    item.quantity = quantity;

    // Recalculate
    await cart.populate('items.product');
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    await cart.save();
    res.status(200).json({ cartItems: cart.items, totalPrice: cart.totalPrice });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update cart item', error });
  }
};

// DELETE /api/cart/:productId
const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.product.toString() !== productId);

    // Recalculate
    await cart.populate('items.product');
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    await cart.save();

    res.status(200).json({ cartItems: cart.items, totalPrice: cart.totalPrice });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove item from cart', error });
  }
};

// DELETE /api/cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = [];
    cart.totalPrice = 0;

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cartItems: [],
      totalPrice: 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear cart', error: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
