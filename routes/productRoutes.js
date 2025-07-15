const express = require("express");
const productRouter = express.Router();
const authSeller = require("../middlewares/authSeller");


const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const upload = require("../middlewares/multer");

// Seller-only routes
productRouter.post('/create', authSeller, upload.single('image'), createProduct);
productRouter.get('/', getAllProducts);



productRouter.get('/:id', getProductById);
productRouter.patch('/update/:id', authSeller, updateProduct);
productRouter.delete('/delete/:id', authSeller, deleteProduct);

module.exports = productRouter;
