const cloudinary = require('../config/cloudinary');
const Product = require('../models/productModel');
const Review = require('../models/reviewModel');
// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { name, description, price, category, size, stock } = req.body;

    if (!name || !description || !price || !category || !size || !stock) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }
  const sizeArray = size.split(',').map((s) => s.trim());
    const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path);

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      size: sizeArray,
      stock,
      image: cloudinaryResponse.url,
      sellerId
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({
      message: "Product created successfully",
      product: savedProduct
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create product",
      error: error.message
    });
  }
};

// GET ALL PRODUCTS (Customer-facing)
const getAllProducts = async (req, res) => {
  try {
    const { category, size } = req.query;

    const query = {};
    if (category) query.category = { $regex: new RegExp(category, "i") };
    if (size) query.size = { $in: [size] }; // ✅ matches array field

    const products = await Product.find(query);
    console.log("🔍 Query:", query, "→ Found:", products.length);
    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Product fetch failed:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// GET SINGLE PRODUCT BY ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('sellerId', 'storeName');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET PRODUCTS BY LOGGED-IN SELLER (for Seller Dashboard)


// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  const productId = req.params.id;
  const sellerId = req.user._id;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  if (product.sellerId.toString() !== sellerId.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  let updatedData = { ...req.body };

  if (req.file) {
    const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path);
    updatedData.image = cloudinaryResponse.url;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    updatedData,
    { new: true, runValidators: true }
  );

  res.status(200).json({ message: "Product updated", product: updatedProduct });
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.sellerId.toString() !== sellerId.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this product" });
    }

    await Product.findByIdAndDelete(productId);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};


module.exports = {
  createProduct,
  getAllProducts,
  getProductById,

  updateProduct,
  deleteProduct
};
