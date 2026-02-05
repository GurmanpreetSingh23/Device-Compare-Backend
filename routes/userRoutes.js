const express = require("express");
const router = express.Router();
const {
  loginUser,
  registerUser,
  logoutUser,
  loggedInUser,
} = require("../controllers/authController");
const { isUserLoggedIn } = require("../middlewares/isUserLoggedIn");
const { isAutheticated } = require("../middlewares/isAuthenticated");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", isUserLoggedIn, logoutUser);
router.get("/me", isAutheticated, loggedInUser);

module.exports = router;
