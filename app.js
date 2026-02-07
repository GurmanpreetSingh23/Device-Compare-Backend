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

const allowedOrigins = [
  "http://localhost:5173",
  "https://device-compare.netlify.app",
];

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(cookieParser());
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
