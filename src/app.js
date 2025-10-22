const express = require("express"); // import express
const {connectDB} = require("./config/database"); // import db connection config
const app = express(); // create web server
const User = require("./models/user"); // import user model

// API to insert data into database

app.post("/signup", async (req,res)=>{
    const userObj = {
        firstName : "Aneesh",
        lastName : "Khanna",
        email:"aneesh@gmail.com",
        password:"aneesh123",
        age: 20,
        gender:"male"
    }

    // create a new instance of userModel and pass data in it

    const user = new User(userObj);

    try{
    // Saving the user instance , returns a promise so make it async await
    await user.save();

    // Send back the response to avoid infinite loop
    res.send("User data added successfully");
    }
    catch(err){
        res.status(400).send("Error saving the user:"+err.message);
    }
})








// Db connection and making server listen
connectDB().then(()=>{
    console.log("Database connection established..."); 

    // if db connected then only start the server

    app.listen(3001 , () => {
    console.log("Server is successfully listening on port 3001....");
    }); // making server listen to requests

})
.catch((err)=>{
    console.error("Database cannot be connected!!");
});

