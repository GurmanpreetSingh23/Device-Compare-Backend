const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/generateToken");


const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Admin registration
module.exports.registerAdmin = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (
      !name.toLowerCase().startsWith("admin") ||
      !password.toLowerCase().startsWith("adminpass")
    ) {
      return res
        .status(403)
        .json({ message: "Admin registration format is invalid." });
    }

    email = email.toLowerCase().trim();

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const createdAdmin = await Admin.create({
      name,
      email,
      password: hash,
      isAdmin: true,
    });

    const token = generateToken(createdAdmin._id);

    res.cookie("token", token, cookieOptions);

    return res.status(201).json({
      message: "Admin registered successfully",
      user: {
        id: createdAdmin._id,
        name: createdAdmin.name,
        email: createdAdmin.email,
        isAdmin: createdAdmin.isAdmin,
      },
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Admin login
module.exports.loginAdmin = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    email = email.toLowerCase().trim();
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(admin._id);

    res.cookie("token", token, cookieOptions);

    return res.json({
      message: "Login successful",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        isAdmin: admin.isAdmin,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Admin logout
module.exports.logoutAdmin = (req, res) => {
  try {
    res.clearCookie("token", cookieOptions);

    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Admin logout error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
