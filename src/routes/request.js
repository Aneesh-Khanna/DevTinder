const express = require("express")
const {userAuth}= require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest")
const User = require("../models/user");
const requestRouter = express.Router();

// Send Connection Request API (Interested in the person)

requestRouter.post("/request/send/:status/:toUserId", userAuth , async(req,res)=>{
    try
    {   const fromUserId = req.user._id; // loggedInUser
        const toUserId = req.params.toUserId; // from the url
        const status = req.params.status; // from the url

        //validation for checking if status passed is correct
        const allowedStatus = ["ignored","interested"];
        if(!allowedStatus.includes(status)){
            throw new Error("Invalid Status Type :" + status);
        }

        //Check if there is existing connectionRequest from A To B or B to A
        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                {fromUserId: fromUserId, toUserId: toUserId},
                {fromUserId: toUserId, toUserId: fromUserId},
            ]
        });
        // if null then only connection request, if we found a object, then dont allow connection request

        if(existingConnectionRequest)
        {
            throw new Error("Connection request already exists!");
        }

        // Check if toUserId is valid user in database
        const toUser = await User.findById(toUserId);
        if(!toUser){
            throw new Error("User not found!");
        }

        // Dont allow a user to send request to itself
        if(fromUserId.equals(toUserId))
        {
            throw new Error("You cant send the request to yourself!!");
        }

        // Create new instance
        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status,
        })

        // save it to db
        const data = await connectionRequest.save();

        const message =
        status === "interested"
        ? "Connection request sent successfully!"
        : "Connection request ignored successfully!";

        // send back the response
        res.json({
            message: message,
            data : data,
        });
    }
    catch(err)
    {
        res.status(400).send("ERROR:"+err.message);
    }
})


// Review Connection Request API (Accept or reject the person)
requestRouter.post("/request/review/:status/:requestId", userAuth , async(req,res)=>{
    try{
        const loggedInUser = req.user;
        const status = req.params.status;
        const requestId = req.params.requestId;

        //Validate status
        const allowedStatus = ["accepted","rejected"];
        if(!allowedStatus.includes(status)){
            throw new Error("Status not allowed");
        }

        //Validate if requestId is present in DB
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status:"interested"
        })

        if(!connectionRequest){
            throw new Error("Connection request not found!!");
        }

        //Now the connection request is valid, now modify the status to accept or rejected

        connectionRequest.status = status; // modify the status

        const data = await connectionRequest.save(); // save the modified instance

        res.json({
            message : "Connection request " + status,
            data
        })
    }
    catch(err){
        res.status(400).send("ERROR:"+err.message);
    }
})

module.exports = requestRouter;