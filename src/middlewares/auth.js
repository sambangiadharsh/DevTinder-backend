const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    // Check if token is missing
    if (!token) {
      // Redirect to login page if not authenticated
      return res.status(401).json({
        success: false,
        message: "Please login to continue.",
        redirectTo: "/login", // Optional: can be handled in frontend
      });
    }

    // Verify the token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user by decoded ID
    const { _id } = decoded;
    const user = await User.findById(_id);

    // If user is not found, throw error
    if (!user) {
      throw new Error("User not found. Please login again.");
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    // Handle token verification error or other issues
    res.status(401).json({
      success: false,
      message: "Authentication failed: " + err.message,
      redirectTo: "/login",
    });
  }
};

module.exports = { userAuth };
