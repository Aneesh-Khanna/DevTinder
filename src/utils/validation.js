const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, email, password, age, gender, photoUrl, about } = req.body;

  // First Name
  if (!firstName || typeof firstName !== "string" || firstName.trim().length < 2 || firstName.trim().length > 20) {
    throw new Error("First name must be a string between 2 and 20 characters.");
  }

  // Last Name
  if (!lastName || typeof lastName !== "string" || lastName.trim().length < 2 || lastName.trim().length > 20) {
    throw new Error("Last name must be a string between 2 and 20 characters.");
  }

  // Email
  if (!email || !validator.isEmail(email)) {
    throw new Error("Email is not valid!");
  }

  // Password
  if (!password || !validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })) {
    throw new Error("Please enter a strong password with uppercase, lowercase, number, and symbol.");
  }

  // Age (optional)
  if (age !== undefined && (typeof age !== "number" || age < 18)) {
    throw new Error("Age must be a number and at least 18.");
  }

  // Gender (optional)
  if (gender !== undefined && !["male", "female", "others"].includes(gender.toLowerCase())) {
    throw new Error("Gender must be 'male', 'female', or 'others'.");
  }

  // Photo URL (optional)
  if (photoUrl !== undefined && !validator.isURL(photoUrl)) {
    throw new Error("Photo URL is invalid.");
  }

  // About (optional)
  if (about !== undefined && (typeof about !== "string" || about.length > 300)) {
    throw new Error("About section must be a string with maximum 300 characters.");
  }
};

const validateEditProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "email",
    "photoUrl",
    "gender",
    "age",
    "about",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );

  return isEditAllowed;
};

module.exports = {
  validateSignUpData,
  validateEditProfileData,
};
