const sendToken = (user, statusCode, res) => {
    //create token
    const token = user.getJwtToken();

    //options needed for the cookie
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME*24*60*60*1000),
        httpOnly:true,
    };

    res.status(statusCode).cookie("token",token,options).json({
        token,
    });
    
    
}


module.exports = sendToken