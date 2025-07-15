const User = require('../models/userModel')
const Seller = require("../models/sellerModel");

const bcrypt = require('bcrypt')
const createToken = require('../utils/generateToken')
const jwt = require('jsonwebtoken');


//register

const register = async (req, res) => {
  try {
    const { name, email, password, phone, profilepic } = req.body;

    console.log("📥 Incoming register body:", req.body); // debug

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone: phone || "", // ✅ Ensures phone is saved if provided
      profilepic: profilepic || "",
      role: 'user'
    });

    const savedUser = await newUser.save();

    const userData = savedUser.toObject();
    delete userData.password;

    console.log("✅ Saved userData:", userData); // debug to confirm phone is present

    res.status(201).json({ message: "Account created", userData });

  } catch (error) {
    console.error('❌ Register Error:', error);
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
};


//login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const originalUser = await User.findOne({ email });
    if (!originalUser) {
      return res.status(400).json({ error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, originalUser.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid Password" });
    }

    const token = jwt.sign({ id: originalUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    });

    // ✅ Create a custom response object with ALL needed fields
    const user = {
      _id: originalUser._id,
      name: originalUser.name,
      email: originalUser.email,
      role: originalUser.role,
      phone: originalUser.phone || "", // <-- Important
      profilepic: originalUser.profilepic || "",
    };

    return res.status(200).json({
      message: "Login successful",
      token,
      user, // ✅ this will now include phone
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};




//profile
const profile =async(req,res,next)=>{
    try{
    const userId=req.user.id
    const userData = await User.findById(userId).select("-password")
    return res.status(200).json({data:userData,message:"profile retrieved"})
    }catch(error){
        console.log(error)
        res.status(error.status||500).json({error:error.message||"Internal server error"})
    }
}
//logout
const logout = async(req,res,next)=>{
    try{
        res.clearCookie("token")
        res.status(200).json({
            success:true,
            message:"Logout Successfully",
        })
    }catch(error){
        console.log(error)
        res.status(error.status||500).json({error:error.message||"Internal server error"})

    }
}
//update
const update = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, phone, password } = req.body || {};

    const updateData = { name, phone };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    return res.status(200).json({
      message: "Profile updated",
      data: updatedUser, // ✅ used by frontend Redux update
    });

  } catch (error) {
    console.error("❌ Update profile error", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};


//delete user
const deleteUser =async(req,res,next)=>{
    try{
    const userId=req.params.userId
    if(!userId){
        return res.status(400).json({error:'User ID is required'});
    }

   
    const userData = await User.findByIdAndDelete(userId)
    if(!userData){
        return res.status(400).json({error:'User not found'}); 
    }
    return res.status(200).json({deletedUser:userData._id,message:"User deleted"})
    }catch(error){
        console.log(error)
        res.status(error.status||500).json({error:error.message||"Internal server error"})
    }
}
const registerSellerByAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if seller already exists
    const existing = await Seller.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Seller already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Set the role as 'seller'
    const newSeller = new Seller({
      name,
      email,
      password: hashedPassword,
      role: "seller", // ✅ add this!
    });

    await newSeller.save();

    res.status(201).json({ message: "Seller registered successfully" });
  } catch (error) {
    console.error("❌ Error in registerSellerByAdmin:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
module.exports={register,login,profile,logout,update,deleteUser,registerSellerByAdmin }