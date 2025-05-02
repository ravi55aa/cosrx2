const express = require("express");
const router = express.Router();

const multer = require("../../../Config/multer");
const { check } = require("express-validator");

const { default: mongoose } = require("mongoose");
const userModel = require("../../../Model/user");
// const authenticateJWT = require("../../../Middleware/authMiddleware");
const {authMiddleware} = require("../../../Config/jwt");

const {
    registerUser,
    uploadUserImage,
    login,
    generateOtp,
    checkEMailForPasswordChange,
    changePassword,
    homePageFetchData
} = require("../../../Controller/userController");

const validateUserRegistration = [
  check("firstName").notEmpty().withMessage("First name is required"),
  check("lastName").notEmpty().withMessage("Last name is required"),
  check("email").isEmail().withMessage("Invalid email format"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

router.post("/register", validateUserRegistration, registerUser);

router.patch("/register/uploadImage",authMiddleware, multer.single("image"), uploadUserImage);

router.get("/homepage/fetchData/:id",authMiddleware,homePageFetchData);

router.post("/login", login);

router.get("/verifyOTP", generateOtp);

router.post("/checkEMailForPasswordChange", checkEMailForPasswordChange);

router.post("/changePassword", changePassword);

module.exports = router;