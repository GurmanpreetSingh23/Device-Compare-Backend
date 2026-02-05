const express = require("express");
const router = express.Router();
const { isUserLoggedIn } = require("../middlewares/isUserLoggedIn");
const {
  getAllProducts,
  searchedProducts,
  fetchProductDetails,
  fetchLaptopAndUpdate,
  deleteDevice,
  fetchMobileAndUpdate,
  registerMobile,
  registerLaptop,
} = require("../controllers/deviceController");
const { isAdminLoggedIn } = require("../middlewares/isAdminLoggedIn");

router.get("/all-products", getAllProducts);
router.get("/search/:query", searchedProducts);
router.get("/product/:id", fetchProductDetails);
router.post("/laptop/update", isAdminLoggedIn, fetchLaptopAndUpdate);
router.post("/mobile/update", isAdminLoggedIn, fetchMobileAndUpdate);
router.delete("/delete/:id", isAdminLoggedIn, deleteDevice);
router.post("/register/mobile", isAdminLoggedIn, registerMobile);
router.post("/register/laptop", isAdminLoggedIn, registerLaptop);

module.exports = router;
