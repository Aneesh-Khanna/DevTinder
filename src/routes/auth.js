const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user"); // import user model
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authRouter = express.Router();

const sendEmail = require("../utils/email"); // to send email

// API to insert data into database in signup
authRouter.post("/signup", async (req, res) => {
  try {
    //Validation of data
    validateSignUpData(req);

    const { firstName, lastName, email, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    //Encrypt password
    const passwordHash = await bcrypt.hash(password, 10);

    //before doing this we should validate the data and encrypt the password

    // create a new instance of userModel and pass data in it

    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      isVerified: false,
    });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiration
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;

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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // allow cross-origin cookies
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    }); // token field : actual token

    // Send welcome email + otp Verification using Resend
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 10px;">
        <h2>Welcome to DevTinder, ${firstName}!</h2>
        <p>Your OTP for email verification is:</p>
        <h3>${otp}</h3>
        <p>This OTP expires in 5 minutes.</p>
        <hr/>
        <p style="font-size:12px;color:#555;">
          If you didn’t sign up for this account, please ignore this email.
        </p>
      </div>
    `;

    const emailResponse = await sendEmail(
      email,
      "Welcome to DevTinder 🎉",
      htmlContent
    );

    if (!emailResponse.success) {
      throw new Error("Please enter a valid email:", emailResponse.message);
    }

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
      if (!user.isVerified) {
        // User is not verified → do NOT send JWT token
        throw new Error("User is not verified.");
      }
      // Create JWT TOKEN

      const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      //Add JWT token to cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS required in prod
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // allow cross-origin cookies
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
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/", // IMPORTANT — must match how it was originally set
    });
    res.send("Successfully logged out.");
  } catch (err) {
    res.status(400).send("Error logging out: " + err.message);
  }
});

authRouter.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found");

    if (user.isVerified) return res.send("User already verified");

    if (user.otp !== otp) return res.status(400).send("Invalid OTP");
    if (user.otpExpiresAt < new Date())
      return res.status(400).send("OTP expired");

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.send("Email verified successfully!");
  } catch (err) {
    res.status(400).send("Error:" + err.message);
  }
});

// Resend OTP API
authRouter.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found");

    if (user.isVerified) return res.send("User already verified");

    // Generate new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiration
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // Send email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 10px;">
        <h2>Hello ${user.firstName},</h2>
        <p>Your new OTP for email verification is:</p>
        <h3>${otp}</h3>
        <p>This OTP expires in 5 minutes.</p>
        <hr/>
        <p style="font-size:12px;color:#555;">
          If you didn’t request this, please ignore this email.
        </p>
      </div>
    `;

    const emailResponse = await sendEmail(
      email,
      "DevTinder OTP Verification 🔑",
      htmlContent
    );

    if (!emailResponse.success) {
      throw new Error("Failed to send email: " + emailResponse.message);
    }

    res.send("OTP resent successfully!");
  } catch (err) {
    res.status(400).send("Error:" + err.message);
  }
});

module.exports = authRouter;
