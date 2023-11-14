const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        maxLength: [50, "Cannot exceed 50 characters"]
    },
    email:{
        type: String,
        required:[true, "Please enter email"],
        unique:true
    },
    password:{
        type:String,
        required:[true,"please enter a password"],
        minLength:[6,"Need password more than 6 characters"],
        select:false
    },
    avatar:{
        public_id: String,
        url: String
    },
    role:{
        type:String,
        default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,


    

},{timestamps: true});


//Password Encryption
userSchema.pre("save", async function(next) {
    if(!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10)

})

//JWT Token assign
userSchema.methods.getJwtToken= function() {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
}


userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
}


//Reset password token
userSchema.methods.getResetPasswordToken = function() {
    //generate a random token
    const resetToken = crypto.randomBytes(20).toString('hex');
    console.log(resetToken,'raja')

    //hash and set it to resetPasswordToken field
    this.resetPasswordToken =crypto.createHash("sha256").update(resetToken).digest("hex");

    //set expiry time
    this.resetPasswordExpire = Date.now() + 30 * 60 *1000;

    return resetToken
}




const User = mongoose.model('User', userSchema);

module.exports = User