// middlewares/authUser.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authUser = async (req, res, next) => {
  try {
    // ✅ Accept token from cookie or header
    const token =
      req.cookies.token ||
      (req.header('Authorization')?.startsWith('Bearer ') &&
        req.header('Authorization')?.split(' ')[1]);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("authUser error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authUser;
