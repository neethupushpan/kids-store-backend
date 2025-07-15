const express = require('express');
const router = express.Router();


const authUser = require('../middlewares/authUser');

const { createOrder, verifyPayment } = require('../controllers/paymentController');

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);

// ✅ Add a GET test route to check if this router is working
router.get('/ping', (req, res) => {
  res.send('✅ Payment route is active');
});

module.exports = router;
