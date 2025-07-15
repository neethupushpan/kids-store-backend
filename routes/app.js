const express = require('express')
const router = express.Router()
const authRouter=require('./authRoutes')
const userRouter = require('./userRoutes')
const sellerRouter = require('./sellerRoutes')
const adminRouter = require('./adminRoutes')
const productRouter = require('./productRoutes')
const orderRouter = require('./orderRoutes');
const cartRouter = require('./cartRoutes')
const reviewRouter = require('./reviewRoutes')

// In routes/app.js or somewhere in your backend
//router.get('/test', (req, res) => {
 // res.json({ message: 'Test successful' });
//});
router.use('/auth',authRouter)
// /api/user
router.use('/user',userRouter)
// /api/admin
router.use('/admin',adminRouter)
// /api/seller
router.use('/seller',sellerRouter)
//productRouter
router.use('/product',productRouter)
//orderRouter
router.use('/orders',orderRouter)
//cartRouter
router.use('/cart',cartRouter)
//reviewRouter
router.use('/review',reviewRouter)
//paymentRouter
module.exports = router 