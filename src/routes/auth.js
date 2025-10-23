const express = require("express");
const {validateSignUpData} = require("../utils/validation") 
const User = require("../models/user"); // import user model
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authRouter = express.Router();

// API to insert data into database in signup
authRouter.post("/signup", async (req,res)=>{

    try{
    //Validation of data 
    validateSignUpData(req);

    const{firstName,lastName,email,password} = req.body;

    //Encrypt password
    const passwordHash = await bcrypt.hash(password,10);

    //before doing this we should validate the data and encrypt the passwor

    // create a new instance of userModel and pass data in it

    const user = new User({
        firstName,
        lastName,
        email,
        password: passwordHash,
    });
    // Saving the user instance , returns a promise so make it async await
    await user.save();

    // Send back the response to avoid infinite loop
    res.send("User data added successfully");
    }
    catch(err){
        res.status(400).send("Error saving the user:"+err.message);
    }
})

// Login API
authRouter.post("/login",async(req,res)=>{
    try
    {   // first we will check if email id is valid, there exists a user with email id 
        // then only we will check password

        const {email,password} = req.body;

        //email id validation check
        const user = await User.findOne({email:email});
        if(!user){
            throw new Error("Invalid credentials");
        }

        // check password
        const isPasswordValid = await bcrypt.compare(password,user.password); // compares plain text with hashed password and returns t/f
        //password is plain text, user.password is hashed password
        if(isPasswordValid)
        {   // Create JWT TOKEN

            const token = await jwt.sign({_id:user._id},"DEV@TINDER$2005",{
                expiresIn: "7d",
            });

            //Add JWT token to cookie
            res.cookie("token",token , {
                expires: new Date(Date.now() + 8 * 360000), 
            }); // token field : actual token

            // send response
            res.send("Login Successful");
        }
        else
        {
            throw new Error("Invalid credentials");
        }
    }
    catch(err)
    {
        res.status(400).send("ERROR:"+err.message);
    }
})

//Logout API
authRouter.post("/logout",async(req,res)=>{
    res.cookie("token",null,{
        expires: new Date(Date.now()),
    })
    res.send("Successfully logged out.");
})

module.exports = authRouter;