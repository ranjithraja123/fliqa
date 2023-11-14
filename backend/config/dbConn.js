const mongoose = require("mongoose")

exports.connectDB = () => {

    let DB_URL = ""

    if(process.env.NODE_ENV === 'DEVELOPMENT') DB_URL= process.env.DB_LOCAL_URI
    if(process.env.NODE_ENV === 'PRODUCTION') DB_URL= process.env.DB_URI




    // mongoose.connect(DB_URL).then((con) => {
    //     console.log(`MongoDB Database connected with HOST: ${con?.connection?.host}`)

    // })

    mongoose.connect( DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology:true,
    })
  .then(() => console.log('DB connection successful!'));
}