const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const jwt = require("jsonwebtoken");

module.exports.isAutheticated = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let account = await User.findById(decoded.id).select("-password");
    let role = "user";

    if (!account) {
      account = await Admin.findById(decoded.id).select("-password");
      role = "admin";
    }

    if (!account) {
      return res.status(401).json({
        success: false,
        message: "Invalid token or account not found",
      });
    }

    req.account = account;
    req.role = role;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
