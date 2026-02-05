const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/generateToken");

module.exports.registerUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.log("All fields required");
      return res.status(400).json({ message: "All fields are required" });
    }

    email = email.toLowerCase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists, Try Logging in!");
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const createdUser = await User.create({
      name,
      email,
      password: hash,
    });

    if (!createdUser) {
      console.log("Unable to register user");
      return res.status(500).json({ message: "User registration failed" });
    }

    const token = generateToken(createdUser._id);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log("User registered successfully");
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
      },
    });
  } catch (err) {
    console.log("Failed to register user:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      console.log("Email and password required");
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    email = email.toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found, please register first");
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Incorrect password");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("User logged in successfully");
    return res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.log("Failed to login user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.logoutUser = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    console.log("User logged out");
    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Failed to logout user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.loggedInUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.account,
    role: req.role,
  });
};
