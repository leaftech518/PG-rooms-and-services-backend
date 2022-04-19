const sendToken = (user,statuscode,res)=>{
    const token = user.getJWTtoken();

    // options for cookies
    const options = {
        httpOnly : true,
        expires : new Date(
            Date.now() + process.env.COOKIE_TIME * 24 * 60 * 60 * 1000
        ),
    };

    res.status(statuscode).cookie("token",token,options).json({
        success :true,
        token,
        user,
    });
};

module.exports =sendToken;