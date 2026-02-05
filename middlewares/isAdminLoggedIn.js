const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
require("dotenv").config();

module.exports.isAdminLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Admin login required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin)
      return res
        .status(401)
        .json({ success: false, message: "Admin not found" });
    if (!admin.isAdmin)
      return res
        .status(403)
        .json({ success: false, message: "Access denied: Not an admin" });

    req.admin = admin;

    console.log(req.admin);
    next();
  } catch (err) {
    console.error("Admin JWT verification failed:", err.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
