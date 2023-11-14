const ErrorHandler = require("../utils/errorHandlers")
const catchAsyncError = require("../middlewares/catchAsyncError");
const User = require("../models/user");
const {jwt} = require('jsonwebtoken');
const sendToken = require("../utils/sendToken");
const getResetPasswordTemplate = require("../utils/emailTemplates");
const sendEmail = require("../utils/sendEmail");
const crypto = require('crypto');
const { upload_file } = require("../utils/cloudinary");



// const signToken = id => {
//     console.log("imin")
//     return jwt.sign({id},process.env.JWT_SECRET,{
//         expiresIn:process.env.JWT_EXPIRES_IN
//     })
// }

exports.registerUser = catchAsyncError(async (req,res,next) => {
    const{name,email,password} = req.body;

    const user = await User.create({
        name,
        email,
        password
    });
    console.log(user._id)

    sendToken(user, 201, res)

})


exports.loginUser = catchAsyncError(async (req,res,next) => {
    const {email,password} = req.body;
 
   if(!email || !password){
    return next(new ErrorHandler('Please enter the email and password',400))
   
}

//Find user if exist
const user = await User.findOne({email}).select("+password")
if(!user) {
    return next(new ErrorHandler("Invalid Email or password", 401))
}


//Check the password
const isPasswordCorrect = await user.comparePassword(password)

if(!isPasswordCorrect) {
    return next(new ErrorHandler("Invalid Email or password", 401))
}

sendToken(user, 200, res)


})


exports.logout = catchAsyncError(async(req,res,next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });


    res.status(200).json({
        message:"Logged Out"
    })
})


//upload avatar


exports.uploadAvatar = catchAsyncError(async (req, res, next) => {
    const avatarResponse = await upload_file(req.body.avatar, "fliqa/avatars");
  
    // Remove previous avatar
    if (req?.user?.avatar?.url) {
      await delete_file(req?.user?.avatar?.public_id);
    }
  
    const user = await User.findByIdAndUpdate(req?.user?._id, {
      avatar: avatarResponse,
    });
  
    res.status(200).json({
      user,
    });
  });





//forgot password
exports.forgotPassword = catchAsyncError(async (req,res,next) => {
  

//Find user if exist
const user = await User.findOne({email:req.body.email});
if(!user) {
    return next(new ErrorHandler("User with this mail not found", 404))
}


//get the reset token
const resetToken = user.getResetPasswordToken()
await user.save()

//create reset password url
const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`

const message = getResetPasswordTemplate(user?.name, resetUrl)

try{

    await sendEmail({
        email:user.email,
        subject:'Your Password Reset Token',
        message
    
    })

    res.status(200).json({
        message: `Email sent to: ${user.email}`
    })

} catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    return next(new ErrorHandler(error?.message, 500))
}




})

//Reset Password by token
exports.resetPassword= catchAsyncError(async(req,res,next)=>{
    //Hash the token in url
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}
    });
    
    if(!user) {
        return next(new ErrorHandler("Password reset token invalid or expired", 400))
    }

    if(req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match", 400))
 
    }

    //set new password

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire =undefined;

    await user.save()

    sendToken(user, 200, res)
  
})


//Get current user Profile
exports.getUserProfile = catchAsyncError(async(req,res,next) => {
    const user = await User.findById(req?.user?._id);
    console.log(user)
    res.status(200).json({
        user
    })
})


//update password after loggin in
exports.updatePassword = catchAsyncError(async(req,res,next) => {
    const user = await User.findById(req?.user?._id).select("+password")


    const isPasswordCorrect = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordCorrect){
        return next(new ErrorHandler("Old Password Incorrect", 400))
    }
    user.password = req.body.password;
    user.save();

    res.status(200).json({
        success: true,
    })



})

//update user profile
exports.updateProfile = catchAsyncError(async (req,res,next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,

    };

    const user = await User.findByIdAndUpdate(req.user._id,newUserData,{
        new: true,
    })

    res.status(200).json({
        user
    })
})


//Get all users admin
exports.allUsers = catchAsyncError(async(req,res,next) => {
    const user = await User.find()
    res.status(200).json({
        user
    })

})


//get user details by id - Admin
exports.getUserDetails = catchAsyncError(async(req,res,next) => {
    const user = await User.findById(req.params.id)

    if(!user) {
        return next(new ErrorHandler('No user found', 400));
      }
    

    res.status(200).json({
        user
    })

})


//update user Details - Admin
exports.updateUser = catchAsyncError(async (req,res,next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,

    };

    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
        new: true,
    })

    if(!user) {
        return next(new ErrorHandler('No user found with this id', 400));
      }

    res.status(200).json({
        user
    })
})




//Delete user by id - Admin
exports.deleteUser = catchAsyncError(async(req,res,next) => {
    const user = await User.findById(req.params.id)

    if(!user) {
        return next(new ErrorHandler('No user found', 400));
      }

      await user.deleteOne()
    

    res.status(200).json({
        success:true
    })

})





