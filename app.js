const express = require("express");
const app = express();

const connectDB = require("./databaseConn/db");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");

// Custom modules
const userRoutes = require("./routes/userRoutes");
const indexRoutes = require("./routes/indexRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Middlewares
app.use(cookieParser());
app.use(cors({
  origin: "https://device-compare.netlify.app",
  credentials: true,
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.use("/", indexRoutes);
app.use("/device-compare/user", userRoutes);
app.use("/device-compare/admin", adminRoutes);
app.use("/device-compare/devices", deviceRoutes);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ DB connection error:", err));
