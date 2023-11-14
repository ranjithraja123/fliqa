const mongoose = require('mongoose')


const productsSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true,'Please add a product name'],
        maxLength:[200, "maximum 200 characters"]
    },
    price:{
        type: Number,
        required:[true,'Please add a product price'],
        maxLength:[10, "maximum 10 digits"]
    },
 
    description:{
        type:String,
        required:[true,"please add a description"],
    },
    ratings:{
        type:Number,
        default: 0
    },
    images:[
        {
            public_id:{
                type:String,
                required: true
            },
            url: {
                type:String,
                required: true
            }
        
        }
    ],
    category:{
       type:String ,
       required: [true, "please enter category of the product"],
        enum:{
            values:["Electronic", "cameras","Laptops","Accessories","Headphones","Food","Books","Sports","outdoor","Home"],
            message:"product must be in category"
        }
    },
    seller:{
        type:String,
        required:[true,"please add a seller"],
    },
    stock:
    {
      type:Number,
      required:[true,"stock is required"]
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews: [
        {
            user:{
                type:String,
                ref:'User',
                required: true
            
            },
            rating: {
                type: Number,
                required:true
            },
            comment: {
                type: String,
                required:true
            }
        }
    ],
    user:{
        type:String,
        ref:'User',
        // required: true
    
    },
    createdAt: {
        type:Date,
        default: Date.now(),
    
        required: true,
    }
  

},{timestamps:true})



const Product = mongoose.model('Product', productsSchema);

module.exports = Product
