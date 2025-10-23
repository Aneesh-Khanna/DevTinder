const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req,res,next)=>{
    //Job of this middleware is to read token from cookies
    //Validate the token
    //Find user

    try{
    const {token} = req.cookies; // to get all cookies, destructuring cookie to fetch token
    if(!token){
        throw new Error("Invalid token");
    }
    //Validate cookie

    const decodedMessage = await jwt.verify(token,"DEV@TINDER$2005");
    const {_id} = decodedMessage;

    // fetch profile of given id of user
    const user = await User.findById(_id);
    if(!user){
        throw new Error("User does not exist.");
    }
    req.user = user; // attach user to req so that it can be used by route handler
    next(); // to move to request handler
    }
    catch(err){
        res.status(400).send("ERROR:"+err.message);
    }
}

module.exports = {
    userAuth, 
};