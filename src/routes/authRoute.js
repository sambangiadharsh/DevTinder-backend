const express = require("express");
const authRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validate } = require("../utils/validate");
const User = require("../models/user");
const bcrypt = require("bcrypt");

// Cookie Options for Dev and Prod
const cookieOptions = {
  httpOnly: true, // ✅ Always use true in production for security
  secure: process.env.NODE_ENV === "production", // Works with HTTPS in production
  sameSite: "None", // Required for cross-origin cookies
  maxAge: 60 * 60 * 1000, // 1 hour expiry
};



// ✅ Signup Route
authRouter.post("/signup", async (req, res) => {
  console.log(req.body);

  try {
    validate(req);

    const user = new User(req.body);
    await user.hashPassword();
    const data = await user.save();

    const token = await user.getJWT();
    res.cookie("token", token, cookieOptions); // ✅ Set cookie correctly

    res.status(201).json({
      message: "Data inserted successfully",
      data,
    });
  } catch (error) {
    console.error("Error inserting user:", error.message);
    res.status(400).send("Not inserted: " + error.message);
  }
});

// ✅ Login Route
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });

    if (!user) {
      return res.status(401).send("Invalid credentials");
    }

    const isPasswordValid = await user.validatepassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();
      res.cookie("token", token, cookieOptions); // ✅ Set cookie correctly

      res.send(user);
    } else {
      return res.status(401).send("Invalid Password");
    }
  } catch (error) {
    res.status(401).send("Bad request: " + error.message);
  }
});

module.exports = authRouter;
