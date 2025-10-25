const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user"); // import user model
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authRouter = express.Router();

// API to insert data into database in signup
authRouter.post("/signup", async (req, res) => {
  try {
    //Validation of data
    validateSignUpData(req);

    const { firstName, lastName, email, password } = req.body;

    //Encrypt password
    const passwordHash = await bcrypt.hash(password, 10);

    //before doing this we should validate the data and encrypt the passwor

    // create a new instance of userModel and pass data in it

    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });
    // Saving the user instance , returns a promise so make it async await
    const savedUser = await user.save();

    // Create JWT TOKEN

    const token = await jwt.sign(
      { _id: savedUser._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    //Add JWT token to cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS required in prod
      sameSite: "none", // allow cross-origin cookies
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    }); // token field : actual token

    res.send(savedUser); // send user details
  } catch (err) {
    res.status(400).send("Error:" + err.message);
  }
});

// Login API
authRouter.post("/login", async (req, res) => {
  try {
    // first we will check if email id is valid, there exists a user with email id
    // then only we will check password

    const { email, password } = req.body;

    //email id validation check
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // check password
    const isPasswordValid = await bcrypt.compare(password, user.password); // compares plain text with hashed password and returns t/f
    //password is plain text, user.password is hashed password
    if (isPasswordValid) {
      // Create JWT TOKEN

      const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      //Add JWT token to cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS required in prod
        sameSite: "none", // allow cross-origin cookies
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      }); // token field : actual token

      // send response
      // res.send("Login Successful");
      res.send(user); // send user details
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});

//Logout API
authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });
    res.send("Successfully logged out.");
  } catch (err) {
    res.status(400).send("Error logging out: " + err.message);
  }
});

module.exports = authRouter;
