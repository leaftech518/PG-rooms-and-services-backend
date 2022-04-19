const mongoose = require("mongoose");
const validator = require("validator");
var uniqueValidator = require('mongoose-unique-validator')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


const userSchema = new mongoose.Schema({
    
    mobileNumber : {
        type : Number,
        unique : true,
        required : [true,"Please enter your mobile number"]
    },
    name : {
        type : String,
        required : [true,"Please Enter your name"],
        maxlength : [25,"Name should not exceed more than 25 characters"],
        minlength : [4,"Name should atleast have 4 characters"],
    },
    email : {
        type : String,
        required : [true,"Please Enter your email id"],
        unique : true,
        validate : [validator.isEmail, "Please enter a valid email"],

    },
    password : {
        type:String,
        required : [true,"Please Enter a password"],
        select : true,
        minlength : [8,"Password should atleast have 8 characters"]
    },
    avatar : {
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    role : {
        type : String,
        default : "user",
    },

    resetpasswordToken : String,
    resetpasswordExpire : Date,
});
 


userSchema.pre("save", async function(next){

    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password,10);

});

// get jwt token

userSchema.methods.getJWTtoken = function () {
    return jwt.sign({ id : this._id },process.env.JWT_TOKEN,{
        expiresIn : process.env.JWT_EXPIRE,
    });

};

//compare passwords 
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password);
};

// generating password reset token
userSchema.methods.getPasswordResetToken = function () {

    //generating token 
    const resetToken = crypto.randomBytes(20).toString("hex");
    
    //adding and hashing reset token to userschema
    this.resetpasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest('hex');

    this.resetpasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
    
};


userSchema.plugin(uniqueValidator);
module.exports = mongoose.model("User",userSchema); 