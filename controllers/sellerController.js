
const Seller =  require('../models/sellerModel')
const bcrypt = require('bcrypt')
const createToken = require('../utils/generateToken')
const Product = require('../models/productModel');

// Admin Register
const register= async (req, res) => {
  try {
    const { name, email, password, storeName } = req.body;

    if (!name || !email || !password || !storeName) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const userExists = await Seller.findOne({ email });
    if (userExists) return res.status(400).json({ error: 'Seller already exists' });

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password,salt)
      console.log(hashedPassword)

   const newUser = new Seller({name,email,password:hashedPassword,storeName,role:'seller'})
   const savedUser = await newUser.save()
   
    

   
    const userData = savedUser.toObject();
    delete userData.password;

   

    return res.status(201).json({ message: 'Seller registered', userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//login
const login= async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const userExists = await Seller.findOne({ email });
    if (!userExists) {
      return res.status(400).json({ error: 'Seller not found' });
    }

    const passwordMatch = await bcrypt.compare(password, userExists.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = createToken(userExists._id, userExists.role);
   

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict'
    });
const userObject = userExists.toObject()
delete userObject.password
    return res.status(200).json({ message: 'Seller login successful', userObject });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
//profile
const profile =async(req,res,next)=>{
    try{
    const userId=req.user.id
    const userData = await Seller.findById(userId).select("-password")
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
    const { name, email, password, profilepic } = req.body || {};

    const updateData = { name, email, profilepic };

    if (password) {
      const salt = await bcrypt.genSalt(10); // ✅ inside async function
      updateData.password = await bcrypt.hash(password, salt);
    }

    const userData = await Seller.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    return res.status(200).json({ data: userData, message: "Profile updated" });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};


//delete seller
const deleteUser =async(req,res,next)=>{
    try{
    const userId=req.params.userId
    if(!userId){
        return res.status(400).json({error:'User ID is required'});
    }

   
    const userData = await Seller.findByIdAndDelete(userId)
    if(!userData){
        return res.status(400).json({error:'User not found'}); 
    }
    return res.status(200).json({deletedUser:userData._id,message:"User deleted"})
    }catch(error){
        console.log(error)
        res.status(error.status||500).json({error:error.message||"Internal server error"})
    }
}
const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.user._id; // ✅ fixed here
    console.log("Fetching products for seller:", sellerId);

    const products = await Product.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch seller products", error: error.message });
  }
};

module.exports={register,login,profile,logout,update,deleteUser,getSellerProducts}
