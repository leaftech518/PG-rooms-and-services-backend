const Errorhandler = require("../utils/errorHandler");

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error";
    
    // handling error when wrong mongodb id input
    if(err.name === "CastError") {
        const message = `Resource not found : Invalid ${err.path}`;
        err = new Errorhandler(message,400);
    }

    //mongoose dupliate key error
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new Errorhandler(message,400);

    }

    if(err.name === "JsonWebTokenError") {
        const message = `Json web token is invalid. Try again`;
        err = new Errorhandler(message,400);
    }

    if(err.name === "TokenExpiredError") {
        const message = `Json web token is Expired . Try again`;
        err = new Errorhandler(message,400);
    }

    res.status(err.statusCode).json({
        success : false,
        message : err.message
    });
};