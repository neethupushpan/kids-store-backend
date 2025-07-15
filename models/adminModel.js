const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
 name:{
    type:String,
    required:[true,'Name is required']
 },
 email:{
    type:String,
    required:[true,'Email is required'],
    unique:true
 },
 password:{
    type:String,
    required:[true,'password is required'],
    minLength:[8,'password must be at least 8 characters long'],
    maxlength:[128,'password cannotbexceed 128 characters ']
 },
 role:{
    type:String,
   
 },
 profilePic:{
    type:String,
    default:null
 }
},
{

 timestamps:true
})



module.exports =mongoose.model('Admin',adminSchema)