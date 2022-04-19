const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");


// create Product function
exports.createProduct  = catchAsyncErrors(async(req,res,nect) =>{

    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
        success:true,
        product
    });
});

// get all products function
exports.getAllProducts = catchAsyncErrors(async(req,res) => {


    const resultperpage = 5;
    const productCount = await Product.countDocuments();
    const apifeatures = new ApiFeatures(Product.find(),req.query).search().filter().pagination(resultperpage);
    const products = await apifeatures.query;


    res.status(200).json({
        success : true,
        products,
        productCount
    });
});

// update product --admin

exports.updateProduct = catchAsyncErrors(async(req,res,next) =>{
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product Not Found",400));
    }

    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new : true,
        runValidators : true,
        useFindAndModify:false
    });

    res.status(200).json({
        success:true,
        product
    });

});

// remove product --admin

exports.deleteProduct = catchAsyncErrors(async(req,res,next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found",400));
    }

    await product.remove();

    res.status(200).json({
        success:true,
        message: "Product removed from database successfully"
    });
});
// get product description 

exports.getProductDescription = catchAsyncErrors( async(req,res,next) =>{
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found",400));
    }

    res.status(200).json({
        success:true,
        product
    });
});

exports.productReview = catchAsyncErrors(async(req,res,next) => {
    const {rating , comment , productID } = req.body;

    const review = {
        name : req.user.name,
        user : req.user._id,
        rating,
        comment,
    };

    const product = await Product.findById(productID);
    const isReviewd = product.reviews.find((rev) => rev.user === req.user._id);
    
    
    if(!isReviewd){

        product.reviews.forEach(rev => {
            if(rev.user === req.user._id)
                (rev.rating = rating), (rev.comment = comment);
        });

    }else{
        product.reviews.push(review);
        product.numberofReviews = product.reviews.length;
    }

    let avg = 0;

    product.rating = product.reviews.forEach((rev)=>{
        avg += rev.rating;

    })
    
    product.rating = avg /product.reviews.length;

    await product.save({ validateBeforeSave : false});

    res.status(200).json({
        success : true,
        message : "review added",
        product : product.reviews
    });
    
});
