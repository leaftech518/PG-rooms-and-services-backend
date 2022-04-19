const User = require("../models/userModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendtoken = require("../utils/jwtToken");
const sendToken = require("../utils/jwtToken");
const crypto = require("crypto");
const sendMail = require("../utils/sendEmail");

// register a user 

exports.registerUser = catchAsyncErrors(async(req,res,next)=>{
    const {name,email,password,mobileNumber} = req.body;

    const user = await User.create({
        name,
        email,
        password,
        mobileNumber,
        avatar : {
            public_id : "this is a sample id",
            url: "this is a sample url"
        },

    });

    sendToken(user,201,res);
});

// login with email

exports.loginUser = catchAsyncErrors(async(req,res,next) => {
    const {email ,password } = req.body;

    if(!email || !password){
        return next(new ErrorHandler("Please enter email and password", 400));
    }

    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invaled email or password"));
    }

    const ispasswordMatched = await user.comparePassword(password);
    
    if(!ispasswordMatched){
        return next(new ErrorHandler("invalied email or password",401));

    }

    sendtoken(user,200,res);

});

// user logout 
exports.logoutUser = catchAsyncErrors(async(req,res,next) => {
    
    res.cookie("token",null, {
        expires : new Date(Date.now()),
        httpOnly : true
    });
    
    res.status(200).json({
        success : true,
        message : "User Logged out"
    });
});

// forgot password 
exports.forgotPassword  = catchAsyncErrors(async(req,res,next) => {

    const user = await User.findOne({ email:req.body.email });
    if(!user){
        return next(new ErrorHandler("User not Found",404));

    }

    // get reset token

    const resetToken = user.getPasswordResetToken();

    await user.save({validateBeforeSave : false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n Please ignore if not requested by you`;

    try {
        await sendMail({
            email: user.email,
            subject: `PG rooms and services pasword recovery`,
            message,
        });

        res.status(200).json({
            success : true,
            message : `Email sent to ${user.email} successfully`
        }); 

        
    } catch (error) {
        user.resetpasswordToken = undefined;
        user.resetpasswordExpire = undefined;

        await user.save({validateBeforeSave : false});

        return next(new ErrorHandler(error.message,500));
    }

});

exports.resetPassword = catchAsyncErrors(async(req,res,next)=> {

    const resetpasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest('hex');

    const user = await User.findOne({
        resetpasswordToken,
        resetpasswordExpire : {$gt:Date.now()},
    });

    if(!user){
        return next(new ErrorHandler("Invalid token or expired token",400));

    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does'nt match",400));
    }

    user.password = req.body.password;
    user.resetpasswordToken = undefined;
    user.resetpasswordExpire = undefined;

    
    await user.save({validateBeforeSave : false});
    console.log(`user : ${user._id}, ${user.name},${user.email}`);
    sendToken(user,200,res);
});

// Get User Detail
exports.getUserDetails = catchAsyncErrors(async(req,res,next) => {
    const user =  await User.findById(req.user.id);
    
    res.status(200).json({
        success : true,
        user : [user.name, user.email ,user.mobileNumber, user.avatar,user.role],
        message : " Ye le bhai tera user",
    });
}); 

// update user password 
exports.updatePassword = catchAsyncErrors(async(req,res,next) => {
    
    const user =  await User.findById(req.user.id).select("+password");
    

    const ispasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!ispasswordMatched){
        return next (new ErrorHandler("Old password is incorrect " , 400));
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match", 400));

    }

    user.password = req.body.newPassword;
    await user.save({validateBeforeSave : false});

    sendToken(user,200,res);

});

//update user details
exports.updateUserDetails = catchAsyncErrors(async(req,res,next) => {

    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        mobileNumber : req.body.number
    };
    // we will add cloudinary later


    const user = await User.findByIdAndUpdate(req.user.id,newUserData, {
        new : true,
        runValidators : true,
        useFindAndModify : false,
    });

    res.status(200).json({
        success : true,
        message: "Your profile data is updated",
    });

});

// GET ALL USERS ("admin")
exports.getAllUsers = catchAsyncErrors(async(req,res,next) => {
    const users = await User.find();

    res.status(200).json({
        success : true,
        users,
    });
});

// GET single user details
exports.getSingleUser = catchAsyncErrors(async(req,res,next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not exist with id : ${req.params.id}`));
    }

    res.status(200).json({
        success : true,
        user,
    });
});


//update user role -admin 
exports.updateUserRole = catchAsyncErrors(async(req,res,next) => {

    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        mobileNumber : req.body.number,
        role : req.body.role
    };

    const user = await User.findByIdAndUpdate(req.params.id,newUserData, {
        new : true,
        runValidators : true,
        useFindAndModify : false,
    });

    res.status(200).json({
        success : true,
        message: "Your profile data is updated",
    });

});


//delete user - admin
exports.deleteUser = catchAsyncErrors(async(req,res,next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not exist with id : ${req.params.id}`));
    }

    await user.remove();

    res.status(200).json({
        success : true,
        message : "user deleted successfully"
    });
});


/// create or update product review
exports.productReview = catchAsyncErrors(async(req,res,next) => {
    const {rating , comment , productID } = req.body;

    const review = {
        name : req.user.name,
        user : req.user._id,
        rating,
        comment,
    };

    const product = await Product.findById(productID);

    const isReviewd = product.reviews.find(rev => rev.user.toString() === req.user._id.toString());

    if(!isReviewd){

        product.reviews.forEach(rev => {
            if(rev.user.toString() === req.user._id.toString())
                (rev.rating = rating), (rev.comment = comment);
        });

    }else{
        product.reviews.push(review);
        product.numberofReviews = product.reviews.length;
    }

    let avg = 0;

    product.rating = product.reviews.forEach((rev)=>{
        avg += rev.rating;

    })/product.reviews.length;

    await product.save({ validateBeforeSave : false});

    res.status(200).json({
        success : true,
        message : "review added"
    });
    
});




