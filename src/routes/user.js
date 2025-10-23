const express = require("express")
const userRouter = express.Router()
const {userAuth} = require("../middlewares/auth")
const ConnectionRequest = require("../models/connectionRequest")
const User = require("../models/user")

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

// GET /user/requests --> fetches all pending incoming requests for logged in user

userRouter.get("/user/requests/received", userAuth, async(req,res)=>{
    try{
        const loggedInUser = req.user;

        // Fetch pending incoming requests
        const connectionRequests = await ConnectionRequest.find({
            toUserId : loggedInUser._id,
            status : "interested",
        }).populate("fromUserId",USER_SAFE_DATA);
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
        }).populate("fromUserId",USER_SAFE_DATA)
        .populate("toUserId",USER_SAFE_DATA);

        // This sends user data + request data
        // We only need users data in a array

        const data = connectionRequests.map((row)=> {
            if(row.fromUserId._id.toString() === loggedInUser._id.toString()){
                return row.toUserId;
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


// GET /feed API -> Gets you the profiles of other users on platform

userRouter.get("/feed", userAuth ,async(req,res) =>{
    try{    
        const loggedInUser = req.user;
        const page = parseInt(req.query.page) || 1; // 1 is default value if not passed
        let limit = parseInt(req.query.limit) || 10; // 10 is default value if not passed
        // let variable to allow reassigning of value
        //restricting limit passed by user
        limit = limit>50 ? 50: limit;

        //params is used for dynamic :id
        //query is used for when passing in parameter feed?parameter

        // skip formula (page-1)*limit
        const skip = (page-1)*limit;

        //Find all connection requests( sent + received)
        const connectionRequests = await ConnectionRequest.find({
            $or:[
                { fromUserId: loggedInUser._id},
                { toUserId: loggedInUser._id}
            ]
        }).select("fromUserId toUserId");

        // these are the users we do not want in feed

        const hideUsersfromFeed = new Set();
        connectionRequests.forEach(request=>{
            hideUsersfromFeed.add(request.fromUserId.toString());
            hideUsersfromFeed.add(request.toUserId.toString());
        });

        // find users data that we want in the feed, whose id is not present in hide user array
        // Array.from(hideUsersfromFeed) converts set to array
        // $nin -> not in , $ne -> not

        const users = await User.find({ 
            $and:[
                {_id: {$nin: Array.from(hideUsersfromFeed)}},
                {_id: {$ne: loggedInUser._id}},
            ],
        }).select(USER_SAFE_DATA).skip(skip).limit(limit);

        res.json({
            data : users
        })
    }
    catch(err){
        res.status(400).json({message:err.message});
    }
})

module.exports = userRouter;