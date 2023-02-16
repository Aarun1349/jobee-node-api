const express = require("express");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const {
  registerUser,
  getAllUsers,
  loginUser,
  forgotPassword,
  resetPassword,
  logout,
} = require("../controllers/authController");
const router = express.Router();

// Route to register new user
router.route("/register").post(registerUser);

// Route to get all users
router.route("/users").get(getAllUsers);

// Route to get login
router.route("/login").get(loginUser);

//Route to recover password
router.route("/password/forgot").post(forgotPassword);

//Route to reset password
router.route("/password/reset/:token").put(resetPassword);

//Route to logout user
router.route("/logout").get(authenticateUser, logout);

module.exports = router;
