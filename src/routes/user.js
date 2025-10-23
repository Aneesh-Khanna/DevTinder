const express = require("express")
const userRouter = express.Router()
const {userAuth} = require("../middlewares/auth")
const ConnectionRequest = require("../models/connectionRequest")

// GET /user/requests --> fetches all pending incoming requests for logged in user

userRouter.get("/user/requests/received", userAuth, async(req,res)=>{
    try{
        const loggedInUser = req.user;

        // Fetch pending incoming requests
        const connectionRequests = await ConnectionRequest.find({
            toUserId : loggedInUser._id,
            status : "interested",
        }).populate("fromUserId",["firstName","lastName","photoUrl","age","gender","about","skills"]);
        // we need to send data of fromUserId , so populate that reference

        // Send response
        res.json({
            message: "Data fetched successfully",
            data: connectionRequests,
        })
    }
    catch(err){
        res.status(400).send("ERROR"+err.message);
    }
})

// GET/user/connections --> fetches all the accepted connections

userRouter.get("/user/connections", userAuth, async(req,res)=>{
    try{
        const loggedInUser = req.user;
        
        // Fetching accepted connections
        const connectionRequests = await ConnectionRequest.find({
            $or:[
                {toUserId: loggedInUser._id,status:"accepted"},
                {fromUserId: loggedInUser._id,status:"accepted"},
            ],
        }).populate("fromUserId",["firstName","lastName","photoUrl","age","gender","about","skills"])
        .populate("toUserId",["firstName","lastName","photoUrl","age","gender","about","skills"]);

        // This sends user data + request data
        // We only need users data in a array

        const data = connectionRequests.map((row)=> {
            if(row.fromUserId._id.toString() === loggedInUser._id.toString()){
                return row.toUser.id;
            }
            return row.fromUserId;
            }
        );

        // send response
        res.json({
            message:"Connections fetched successfully!",
            data: data,
        });
    }
    catch(err){
        res.status(400).send("ERROR"+err.message);
    }
})



module.exports = userRouter;