const express = require('express');
const orderRouter = express.Router();
const { getSellerOrders } = require('../controllers/orderController');
const authSeller = require('../middlewares/authSeller');
//const { getUserOrdersById } = require('../controllers/orderController');

const {
  createOrder,
  getUserOrders,
  getAllOrders,updateOrderStatus
} = require('../controllers/orderController');

const authUser = require('../middlewares/authUser');
const authAdmin = require('../middlewares/authAdmin');
const authAdminOrSeller = require('../middlewares/authAdminOrSeller');
// Place Order (after payment success)
orderRouter.post('/place', authUser, createOrder);

// User Orders
orderRouter.get('/my-orders', authUser, getUserOrders);

// Admin or Seller: View all orders

orderRouter.get('/all-orders', authAdmin, getAllOrders);
orderRouter.get('/seller-orders', authSeller, getSellerOrders);
orderRouter.put('/update/:orderId', authAdminOrSeller, updateOrderStatus);
orderRouter.get('/test', (req, res) => {
  res.send('✅ Seller route works');
});
//orderRouter.get('/user/:userId', authUser, getUserOrdersById);

module.exports =orderRouter;
