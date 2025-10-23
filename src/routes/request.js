const express = require("express")
const {userAuth}= require("../middlewares/auth")
const requestRouter = express.Router();

// Send Connection Request API

requestRouter.post("/sendConnectionRequest", userAuth , async(req,res)=>{
    try
    {
        // sending a connection request
        res.send("Connection req sent");
    }
    catch(err)
    {
        res.status(400).send("ERROR:"+err.message);
    }
})

module.exports = requestRouter;