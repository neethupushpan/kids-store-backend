//product-add,edit,delete
//auth
//register,login,profile,update profile,logout


const express = require('express')
const sellerRouter =express.Router()
const {register,getSellerProducts} = require("../controllers/sellerController")
const {login,profile,logout,update,deleteUser} =require("../controllers/sellerController")

const authAdmin = require('../middlewares/authAdmin')

const authSeller = require('../middlewares/authSeller')
//signup
// /api/user/register
sellerRouter.post('/register',register)

//login
// /api/user/login
 sellerRouter.post('/login',login)
//logout
sellerRouter.get('/logout',logout)
//profile
sellerRouter.get('/profile',authSeller,profile)
//profile-update
sellerRouter.patch('/update',authSeller,update)
//delete
sellerRouter.delete('/delete/:userId',authAdmin,deleteUser)
sellerRouter.get('/products', authSeller, getSellerProducts);

module.exports = sellerRouter