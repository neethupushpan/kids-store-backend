const User = require('../models/userModel');
const Admin = require('../models/adminModel');
const Seller = require('../models/sellerModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user =
      await User.findOne({ email }) ||
      await Admin.findOne({ email }) ||
      await Seller.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // ✅ Set JWT in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // false in dev
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

  return res.status(200).json({
  message: 'Login successful',
  token, // <-- ADD this!
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  },


    });
  } catch (err) {
    console.error('🔥 Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
