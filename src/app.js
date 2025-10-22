const express = require("express"); // import express
const {connectDB} = require("./config/database"); // import db connection config
const app = express(); // create web server
const User = require("./models/user"); // import user model

app.use("/",express.json()); // middleware to get json data from req at all routes

// API to insert data into database in signup form

app.post("/signup", async (req,res)=>{
    // const userObj = {
    //     firstName : "",
    //     lastName : "",
    //     email:"",
    //     password:"",
    //     age: 2,
    //     gender:""
    // }
    const userObj = req.body;

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

//Get user by email sent in req
app.get("/user", async (req,res)=>{
    const useremail = req.body.email; // fetch email from req object
    
    try{
    //find() takes a filter, gives array of objects
    const users = await User.find({email:useremail});
    if(users.length === 0)
    {
        res.status(404).send("User not found");
    }
    else
    {
        //send data to user if found
        res.send(users);
    }
    }
    catch(err){
        res.status(400).send("Something went wrong, couldn't send user data");
    }
})
// Feed API - GET/feed - to get all users from the database

app.get("/feed", async (req,res)=>{
    try{
        const users = await User.find({}); // {} empty filter returns all documents
        res.send(users);
    }
    catch(err)
    {   
        res.status(400).send("Something went wrong, couldn't send user data");
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

