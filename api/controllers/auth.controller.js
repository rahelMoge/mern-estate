import bcrypt from "bcryptjs"; // Library for hashing and comparing passwords
import mongoose from 'mongoose';
import User from "../models/user.model.js"; // MongoDB User model
import { errorHandler } from "../utils/error.js"; // Custom error handling function
import jwt from "jsonwebtoken"; // Library to create authentication tokens (JWT)

// SIGNUP
export const signup = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) return next(errorHandler(503, 'Database not connected'));
  const { username, email, password } = req.body; // Get user data from request body

  const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password before saving

  const newUser = new User({ username, email, password: hashedPassword }); // Create new user object

  try {
    await newUser.save(); // Save the new user to MongoDB
    res.status(201).json("User created successfully!"); // Send success response
  } catch (error) {
    next(error); // Pass error to middleware
  }
};

// SIGNIN
export const signin = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) return next(errorHandler(503, 'Database not connected'));
  const { email, password } = req.body; // Get login credentials

  try {
    const validUser = await User.findOne({ email }); // Find user by email in database
    if (!validUser) return next(errorHandler(404, "User not found")); // If user doesn't exist

    const validPassword = bcrypt.compareSync(password, validUser.password); // Compare passwords
    if (!validPassword) return next(errorHandler(401, "Wrong credentials!")); // If password incorrect

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET); // Generate JWT token
    const { password: pass, ...rest } = validUser._doc; // Remove password before sending user data

    res
      .cookie("access_token", token, { httpOnly: true }) // Store JWT in secure cookie
      .status(200)
      .json(rest); // Send user information to frontend
  } catch (error) {
    next(error); // Pass error to middleware
  }
};


// GOOGLE LOGIN
export const google = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) return next(errorHandler(503, 'Database not connected'));
  try {

    const user = await User.findOne({ email: req.body.email }); // Check if Google user already exists

    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET); // Create JWT token for existing user
      const { password: pass, ...rest } = user._doc; // Remove password from response

      res
        .cookie('access_token', token, { httpOnly: true }) // Save token in cookie
        .status(200)
        .json(rest); // Send user data

    } else {

      const generatedPassword =
        Math.random().toString(36).slice(-8) + // Generate random password part
        Math.random().toString(36).slice(-8); // Generate second random password part

      const hashedPassword = bcrypt.hashSync(generatedPassword, 10); // Hash generated password

      const newUser = new User({
        username:
          req.body.name.split(" ").join("").toLowerCase() + // Create username from Google name
          Math.random().toString(36).slice(-4), // Add random characters to username
        email: req.body.email, // Save Google email
        password: hashedPassword, // Save hashed password
        avatar: req.body.photo // Save Google profile photo
      });

      await newUser.save(); // Save new Google user to database

      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET); // Generate JWT token
      const { password: pass, ...rest } = newUser._doc; // Remove password before sending response

      res
        .cookie('access_token', token, { httpOnly: true }) // Store token in cookie
        .status(200)
        .json(rest); // Send new user data
    }

  } catch (error) {
    next(error); // Pass error to middleware
  }
};
