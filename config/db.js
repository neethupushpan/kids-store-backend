const mongoose = require('mongoose');

const connectDB = async()=>
{
    const dbUrl = process.env.MONGODB_URL
   console.log("MongoDB URL:", dbUrl);

try{
    await mongoose.connect(dbUrl)
    

    console.log("DB connected..")


}catch(error){
    console.error("DB connection error:", error.message);
    process.exit(1); // Stop the app on DB failure
}
}
module.exports = connectDB;