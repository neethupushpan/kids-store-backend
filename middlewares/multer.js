const multer = require("multer")

const cloudinary = require('../config/cloudinary'); // adjust path as needed

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // make sure this folder exists
  },
  filename: function (req, file, cb) {
  console.log(file)
  cb(null, file.originalname )

  }
});
const upload = multer({ storage: storage })
module.exports = upload