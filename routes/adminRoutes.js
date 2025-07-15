
const express = require('express')
const adminRouter =express.Router()
const {register} = require("../controllers/adminController")
const {
  login,
  profile,
  logout,
  update,
  deleteUser,
  getAllUsers,     // ✅ Add this
  updateUser     // ✅ Add if using admin update route
} = require("../controllers/adminController");
const {getAllProducts,deleteProduct} = require("../controllers/adminController")
const { getAdminStats } = require('../controllers/adminController');
const authAdmin = require('../middlewares/authAdmin')


//signup
// /api/user/register
adminRouter.post('/register',register)

//login
// /api/user/login
adminRouter.post('/login',login)
//logout
adminRouter.get('/logout',logout)
//profile
adminRouter.get('/profile',authAdmin,profile)
//profile-update
adminRouter.patch('/update',authAdmin,update)
//delete
adminRouter.delete('/delete/:userId',authAdmin,deleteUser)
// Admin profile
adminRouter.get('/profile', authAdmin, profile);

// Update admin profile
adminRouter.patch('/update', authAdmin, update);

// Get all users
adminRouter.get('/users', authAdmin, getAllUsers); // ✅

// Update a user (role, status, etc.)
adminRouter.patch('/user/:userId', authAdmin, updateUser); // ✅

adminRouter.get('/products', authAdmin, getAllProducts);
adminRouter.delete('/products/:id', authAdmin, deleteProduct);

adminRouter.get('/stats', authAdmin, getAdminStats);


module.exports = adminRouter