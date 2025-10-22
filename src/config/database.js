// File for database connection
const {MONGODB_URI} = require("../constants");

const mongoose = require("mongoose");

const connectDB = async() => {
    await mongoose.connect(MONGODB_URI);  
    // mongoose.connect returns a promise, so write it inside a async await function
};

// whenever we call connectDB function, it connects to database or it returns a promise
// so we need to handle promise

module.exports={connectDB};

/*
//resolving promise
connectDB().then(()=>{
    console.log("Database connection established..."); 
})
.catch((err)=>{
    console.error("Database cannot be connection!!");
});
*/