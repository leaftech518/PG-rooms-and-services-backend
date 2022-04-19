const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required : [true,"Please Your Enter Your name"],
        trim : true
    
    },

    description:{
        type : String,
        required : [true,"Please Enter product description"]
    },
    price :{
        type : Number,
        required : [true,"Please Enter product price"],
        maxlength : [8,"Price cannot exceed 8 characters"]
    },
    rating : {
        type : Number,
        required : [true,"Please provide proper rating for the above product"],
        default : 0
    },
    images : [
        {
            public_id : {
                type: String,
                required : true
            },
            url : {
                type: String,
                required : true
            }
        }
    ],
    category : {
        type : String,
        required : [true,"Please Enter prodcut category"]
    },
    stock : {
        type:Number,
        required:[true,"Please enter the stock quantity"],
        default : 1
    
    },
    numberofReviews:{
        type:Number,
        default : 0
    },
    reviews: [
        {
            user :{
                type : mongoose.Schema.ObjectId,
                ref: "User",
                required : true,
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],

    user :{
        type : mongoose.Schema.ObjectId,
        ref: "User",
        required : true,
    },
    
    createdAt:{
        type:Date,
        default:Date.now
    }
})


module.exports = mongoose.model("Product",productSchema);