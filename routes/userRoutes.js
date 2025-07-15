const express = require('express')
const userRouter =express.Router()
const {register} = require("../controllers/userController")
const {login,profile,logout,update,deleteUser,registerSellerByAdmin } =require("../controllers/userController")
const authUser = require('../middlewares/authUser')
const authAdmin = require('../middlewares/authAdmin')
 
// /api/user/register
userRouter.post('/register',register)

//login
// /api/user/login
userRouter.post('/login', login);
  
//logout
userRouter.get('/logout',logout)
//profile
userRouter.get('/profile',authUser,profile)
//profile-update
userRouter.patch('/update',authUser,update)
//delete
userRouter.delete('/delete/:userId',authAdmin,deleteUser)
userRouter.post('/admin/register-seller', authAdmin, registerSellerByAdmin);

module.exports = userRouter