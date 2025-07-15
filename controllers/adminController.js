const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const Seller = require('../models/sellerModel'); // ✅ add this if you support sellers
const bcrypt = require('bcrypt');
const createToken = require('../utils/generateToken');
const Product = require('../models/productModel');
const Order = require("../models/orderModel");


// Admin Register
const register = async (req, res) => {
  try {
    const { name, email, password, accessLevel = 1 } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const userExists = await Admin.findOne({ email });
    if (userExists) return res.status(400).json({ error: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new Admin({ name, email, password: hashedPassword, role: 'admin', accessLevel });
    const savedUser = await newUser.save();
    const userData = savedUser.toObject();
    delete userData.password;

    return res.status(201).json({ message: 'Admin registered', userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "All fields are required" });

    const userExists = await Admin.findOne({ email });
    if (!userExists) return res.status(400).json({ error: "User not found" });

    const passwordMatch = await bcrypt.compare(password, userExists.password);
    if (!passwordMatch) return res.status(400).json({ error: "Invalid Password" });

    const token = createToken(userExists._id, userExists.role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict'
    });

    const userObject = userExists.toObject();
    delete userObject.password;

    return res.status(200).json({ message: "Login successful", userObject });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
};

// Profile
const profile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = await Admin.findById(userId).select("-password");
    return res.status(200).json({ data: userData, message: "Profile retrieved" });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logout Successfully" });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
};

// Update admin profile
const update = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, password, profilepic } = req.body || {};

    const userData = await Admin.findByIdAndUpdate(
      userId,
      { name, email, password, profilepic },
      { new: true }
    ).select("-password");

    return res.status(200).json({ data: userData, message: "Profile updated" });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
};

// ❌ DELETE any user (customer or seller)
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const deleted = await User.findByIdAndDelete(userId) ||
                    await Seller.findByIdAndDelete(userId);

    if (!deleted) return res.status(404).json({ error: "User not found" });

    return res.status(200).json({ deletedUser: deleted._id, message: "User deleted" });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
};

//
// ✅ NEW FOR MANAGE USERS
//

// GET all users (customers + sellers)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    const sellers = await Seller.find().select('-password');

    const allUsers = [
      ...users.map((u) => ({ ...u.toObject(), userType: 'customer' })),
      ...sellers.map((s) => ({ ...s.toObject(), userType: 'seller' })),
    ];

    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users", details: error.message });
  }
};

// PATCH user info (e.g., role/status)
const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { name, email, role, status } = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, { name, email, role, status }, { new: true }) ||
                 await Seller.findByIdAndUpdate(userId, { name, email, role, status }, { new: true });

    if (!user) return res.status(404).json({ error: "User not found" });

    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({ message: "User updated", data: userData });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user", details: error.message });
  }
};
 // GET all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Failed to fetch products:", error.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};
// DELETE product
const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAdminStats = async (req, res) => {
  try {
    console.log("⚙️ Starting admin stats fetch...");

    const totalUsers = await User.countDocuments();
    console.log("✅ Total users:", totalUsers);

    const totalOrders = await Order.countDocuments();
    console.log("✅ Total orders:", totalOrders);

    const totalProducts = await Product.countDocuments();
    console.log("✅ Total products:", totalProducts);

    res.json({ totalUsers, totalOrders, totalProducts });
  } catch (error) {
    console.error("❌ Error in getAdminStats:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = {
  register,
  login,
  profile,
  logout,
  update,
  deleteUser, // this works as "removeUser"
  getAllUsers,
  updateUser,  getAllProducts,
  deleteProduct,getAdminStats
};
