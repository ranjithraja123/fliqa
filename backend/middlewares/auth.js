const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandlers");
const catchAsyncError = require("./catchAsyncError");
const jwt = require('jsonwebtoken');


const isAuthenticatedUser = catchAsyncError(async (req,res,next) => {
    const {token} = req.cookies;

    if(!token){
        return next(new ErrorHandler('Login first to access resouce', 401))
    }


    const decoded = jwt.verify(token,process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id)


    next()
})

const authorizeRoles = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role {${req.user.role}} is not allowed to access`, 403))

        }
        next();
    }
}


module.exports = {isAuthenticatedUser,authorizeRoles}