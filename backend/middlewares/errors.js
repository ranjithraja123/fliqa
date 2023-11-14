const ErrorHandler = require("../utils/errorHandlers");

const errorMiddleware  = (err, req,res, next) => {
    let error = {
        statusCode: err?.statusCode || 500,
        message: err?.message || 'Internal Server Error'
    };

    //Handle Mongoose Id error
    if(err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err?.path}`;
        error = new ErrorHandler(message,404)
        
    }
   
    //Handle ValidationError
    if(err.name === "ValidationError") {
        const message = Object.values(err.errors).map((value) => value.message);
        error = new ErrorHandler(message,400)
        
    }

    //Duplicate error
    if(err.code === "11000") {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        error = new ErrorHandler(message,400)
        
    }

    //JwT error
    if(err.name === "JsonWebTokenError") {
        const message = `Invalid JSON web token`;
        error = new ErrorHandler(message,400)
        
    }

    //token expired JWT
    if(err.name === "JsonWebTokenError") {
        const message = `JSON web token expired`;
        error = new ErrorHandler(message,400)
        
    }


    if(process.env.NODE_ENV === "DEVELOPMENT") {
        res.status(error.statusCode).json({
            message:error.message,
            error: err,
            stack: err?.stack
        })
    }
    if(process.env.NODE_ENV === "PRODUCTION") {
        res.status(error.statusCode).json({
            message:error.message
        })
    }


   
}

module.exports = errorMiddleware