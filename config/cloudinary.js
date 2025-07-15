const cloudinary= require('cloudinary').v2;
require('dotenv').config();
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_SECRET_KEY//click view api keys above to copy your API secret
});
console.log('🔍 Cloudinary ENV:', {
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY
});

module.exports=cloudinary;