const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncErrors(async(req,res,next) => {
    const {token} = req.cookies;


    if(!token){
        return next(new ErrorHandler("Please Login to access this resource", 401));
    }

    const decodedData = jwt.verify(token,process.env.JWT_TOKEN);

    req.user = await userModel.findById(decodedData.id);

    next();
});

exports.authorizedRoles = (...roles) => {

    return (req,res,next) => {
        if(!roles.includes(req.user.role)) {
            return next (new ErrorHandler(
                `Role ${req.user.role} is not granted permission to access this resource`,
                403
            ));
        }
        next();
    };
    

};