const express = require("express");
const router = express.Router();
const {
  loginUser,
  registerUser,
  logoutUser,
  loggedInUser,
  updateUser,
} = require("../controllers/authController");
const { isUserLoggedIn } = require("../middlewares/isUserLoggedIn");


router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/update", isUserLoggedIn, updateUser);
router.get("/logout", isUserLoggedIn, logoutUser);
router.get("/me", isUserLoggedIn, loggedInUser);

module.exports = router;
