const Order = require('../models/order')
const Product = require('../models/product')

const ErrorHandler = require('../utils/errorHandlers')
const catchAsyncError = require('../middlewares/catchAsyncError')



//Create new orders
exports.newOrder = catchAsyncError(async(req,res,next) => {
    const{orderItems,
        shippingInfo,
        itemsPrice,
        taxAmount,
        shippingAmount,
        totalAmount,
        paymentMethod,
        paymentInfo} = req.body;


        const order = await Order.create({
            orderItems,
        shippingInfo,
        itemsPrice,
        taxAmount,
        shippingAmount,
        totalAmount,
        paymentMethod,
        paymentInfo,
        user: req.user._id
        })
        
        res.status(200).json({
            order,
        })
})


exports.getOrderDetails = catchAsyncError(async (req,res,next) => {
    const order = await Order.findById(req.params.id).populate("user", "name email");
   
    if(!order){
        return next(new ErrorHandler('No order found with this id', 404))
    }
    res.status(200).json({
        order,
    })
})

//Get current users orders
exports.myOrders = catchAsyncError(async (req,res,next) => {
    const order = await Order.find({user:req.user._id});
   
    if(!order){
        return next(new ErrorHandler('No order found with this id', 404))
    }
    res.status(200).json({
        order,
    })
})



//Get all order--admin
exports.allOrders = catchAsyncError(async (req,res,next) => {
    const order = await Order.find();
   
    
    res.status(200).json({
        order,
    })
})


//update order--admin
exports.updateOrder = catchAsyncError(async (req,res,next) => {
    const order = await Order.findById(req.params.id)
    if(!order){
        return next(new ErrorHandler('No order found with this id', 404))
    }

    if(order?.orderStatus === "Delivered"){
        return next(new ErrorHandler('You have already delivered this order', 400))
    }

    order?.orderItems?.forEach(async (item) => {
        const product = await Product.findById(item?.product?.toString());
        if(!product){
            return next(new ErrorHandler('No product found with this id', 404))
        }
        product.stock = product.stock -item.quantity;
        await product.save({validateBeforeSave:false})
    
    })

    order.orderStatus = req.body.status;
    order.deliveredAt =Date.now()

    await order.save()
   

   
    
    res.status(200).json({
        order,
    })
})



//delete Order -- Admin
exports.deleteOrder = catchAsyncError(async (req,res,next) => {
    const order = await Order.findById(req.params.id);
   
    if(!order){
        return next(new ErrorHandler('No order found with this id', 404))
    }

    await order.deleteOne()
    res.status(200).json({
        success: true
    })
})

async function getSalesData(startDate, endDate) {
    const salesData = await Order.aggregate([
      {
        // Stage 1 - Filter results
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        // Stage 2 - Group Data
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          totalSales: { $sum: "$totalAmount" },
          numOrders: { $sum: 1 }, // count the number of orders
        },
      },
    ]);
  
    // Create a Map to store sales data and num of order by data
    const salesMap = new Map();
    let totalSales = 0;
    let totalNumOrders = 0;
  
    salesData.forEach((entry) => {
      const date = entry?._id.date;
      const sales = entry?.totalSales;
      const numOrders = entry?.numOrders;
  
      salesMap.set(date, { sales, numOrders });
      totalSales += sales;
      totalNumOrders += numOrders;
    });
  
    // Generate an array of dates between start & end Date
    const datesBetween = getDatesBetween(startDate, endDate);
  
    // Create final sales data array with 0 for dates without sales
    const finalSalesData = datesBetween.map((date) => ({
      date,
      sales: (salesMap.get(date) || { sales: 0 }).sales,
      numOrders: (salesMap.get(date) || { numOrders: 0 }).numOrders,
    }));
  
    return { salesData: finalSalesData, totalSales, totalNumOrders };
  }
  
  function getDatesBetween(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
  
    while (currentDate <= new Date(endDate)) {
      const formattedDate = currentDate.toISOString().split("T")[0];
      dates.push(formattedDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dates;
  }


exports.getSales = catchAsyncError(async (req, res, next) => {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
  
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);
  
    const { salesData, totalSales, totalNumOrders } = await getSalesData(
      startDate,
      endDate
    );
  
    res.status(200).json({
      totalSales,
      totalNumOrders,
      sales: salesData,
    });
  });