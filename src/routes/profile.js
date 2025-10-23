const express = require("express");
const {userAuth}= require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");
const profileRouter = express.Router();

// Profile API (Get profile details)
profileRouter.get("/profile/view", userAuth,  async (req,res)=>{
    try{
    const user = req.user; // passed from auth.js
    res.send(user); // send response, dont need to check user exist, we already check in auth.js
    }
    catch(err)
    {
        res.status(400).send("ERROR:"+err.message);
    }
})

// edit profile details

profileRouter.patch("/profile/edit",userAuth, async (req,res)=>{
    try{
       // Check if edit operation is allowed
       if(!validateEditProfileData(req)){
         throw new Error("Invalid Edit Request");
       }
       // in auth we already validate user, find user and return user object
       const loggedInUser = req.user; // from auth middleware

       Object.keys(req.body).forEach((key)=>{loggedInUser[key] = req.body[key]});
       // updating loggedin user object

       await loggedInUser.save(); // save updated instance to db

    //    res.send(`${loggedInUser.firstName}, your profile was edited successfully`)
       res.json({
          message:`${loggedInUser.firstName}, your profile was edited successfully`,
          data:loggedInUser,
       });

    }
    catch(err){
        res.status(400).send("ERROR:"+err.message);
    }
})

//  Change Password API
profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const user = req.user; // comes from middleware
    const { currentPassword, newPassword } = req.body;

    //  Check if both fields are provided
    if (!currentPassword || !newPassword) {
      throw new Error("Both current and new passwords are required.");
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error("Current password is incorrect.");
    }

    //Validate new password strength
    if (!validator.isStrongPassword(newPassword)) {
      throw new Error("Please choose a stronger password.");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password in DB
    user.password = hashedPassword;
    await user.save();

    //  Send success response
    res.send("Password updated successfully!");
  } catch (err) {
    res.status(400).send("Error updating password: " + err.message);
  }
});

module.exports = profileRouter;