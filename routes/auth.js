const express = require("express");
const { registerUser, getAllUsers, loginUser } = require("../controllers/authController");
const router = express.Router();

// Route to register new user
router.route("/register").post(registerUser);

// Route to get all users
router.route("/users").get(getAllUsers);

// Route to get login 
router.route("/login").get(loginUser);

module.exports = router;
