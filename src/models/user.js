const mongoose = require("mongoose");
const { USER_AVATAR } = require("../constants");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 20,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 20,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address:" + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a Strong Password: " + value);
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value.toLowerCase())) {
          throw new Error("Not a valid Gender");
        }
      },
    },
    photoUrl: {
      type: String,
      default: USER_AVATAR,
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid Photo URL:" + value);
        }
      },
    },
    about: {
      type: String,
      default: "Hi! I am new to DevTinder!",
      maxlength: 300,
    },
    skills: {
      type: [String], // array of strings
    },
    isVerified: {
      type: Boolean,
      default: false, // user is not verified initially
    },

    otp: {
      type: String, // store 6-digit OTP temporarily
    },

    otpExpiresAt: {
      type: Date, // OTP expiration timestamp
    },
  },
  { timestamps: true }
  // it will create createdAt and updatedAt fields automatically.
);

// const userModel = mongoose.model("User",userSchema);

// module.exports = userModel;

module.exports = mongoose.model("User", userSchema);
