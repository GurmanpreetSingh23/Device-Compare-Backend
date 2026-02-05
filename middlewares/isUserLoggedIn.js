const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require("dotenv").config();

module.exports.isUserLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const existingUser = await User.findById(decoded.id).select("-password");
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid token or user not found",
      });
    }

    req.user = existingUser;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
