const express = require("express");
const {userAuth}= require("../middlewares/auth")
const profileRouter = express.Router();

// Profile API (Get profile details)
profileRouter.get("/profile", userAuth,  async (req,res)=>{
    try{
    const user = req.user; // passed from auth.js
    res.send(user); // send response, dont need to check user exist, we already check in auth.js
    }
    catch(err)
    {
        res.status(400).send("ERROR:"+err.message);
    }
})


module.exports = profileRouter;