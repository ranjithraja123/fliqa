// import express from "express";
const express = require("express")
const app = express();
const dotenv = require("dotenv")
const cookieParser = require('cookie-parser')
const ProductRoutes = require('./routes/productRoutes')
const authRoutes = require('./routes/auth')
const orderRoutes = require('./routes/order')

const {connectDB} = require('./config/dbConn')
const mongoose = require('mongoose')
const errorMiddleware = require('./middlewares/errors')

// handling uncaught exception //log ''
process.on("uncaughtException", (err) => {
    console.log(`ERROR: ${err}`);
    console.log("Shutting Down sue to uncaught exception");
    process.exit(1)
})

dotenv.config({path: "./config/config.env"});

let DB = ""

if(process.env.NODE_ENV === 'DEVELOPMENT') DB= process.env.DB_LOCAL_URI
if(process.env.NODE_ENV === 'PRODUCTION') DB= process.env.DB_URI

  
  mongoose
    .connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology:true,
    })
    .then(() => console.log('DB connection successfull!'));

app.use(express.json({limit:"10mb"}))
app.use(cookieParser())


app.use("/api/v1",ProductRoutes);
app.use("/api/v1",authRoutes);
app.use("/api/v1",orderRoutes);






app.use(errorMiddleware)

const server =app.listen(process.env.PORT, () => {
    console.log(`Server started at port:${process.env.PORT} in ${process.env.NODE_ENV} mode`);
})


//Unhandled promise rejection //mongodb+
process.on('unhandledRejection', (err, promise) =>{
    console.log(`Error: ${err}`);
    console.log("Shutting down server due to unhandled promise")
    server.close(() => {
        process.exit(1)
    });
    
});