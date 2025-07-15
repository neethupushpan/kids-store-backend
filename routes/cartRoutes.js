const express = require('express');
const cartRoutes = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');

const  authUser  = require('../middlewares/authUser')

// Get current user's cart
//cartRoutes.get('/:userId', authUser, getCart);
cartRoutes.get('/', authUser, getCart); // ✅ Fetch cart for logged-in user

// Add a product to cart
cartRoutes.post('/', authUser, addToCart);

// Update quantity of a product in cart
cartRoutes.patch('/:productId', authUser, updateCartItem);

// Remove a product from cart
cartRoutes.delete('/:productId', authUser, removeFromCart);

// Clear entire cart
cartRoutes.delete('/', authUser, clearCart);
// cartRoutes.get('/cart',authUser,getCart)
module.exports = cartRoutes;
