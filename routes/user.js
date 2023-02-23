const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUserPassword,
  updateUser,
  deleteUser,
  getAppliedJobs,
  getAllPublished,
  getUsers,
  deleteUserAdmin,
} = require("../controllers/userController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");

router.use(authenticateUser);

router.route("/me").get(authenticateUser, getUserProfile);
router.route("/user/password").put(authenticateUser, updateUserPassword);
router.route("/me/update").put(authenticateUser, updateUser);
router.route("/me/remove").delete(authenticateUser, deleteUser);
router
  .route("/jobs/applied")
  .get(authenticateUser, authorizeRoles("user"), getAppliedJobs);
router
  .route("/jobs/published")
  .get(authenticateUser, authorizeRoles("employer", "admin"), getAllPublished);

// Admin Only Routes

router.route("/users").get(authenticateUser, authorizeRoles("admin"), getUsers);
router
  .route("/user/:id")
  .delete(authenticateUser, authorizeRoles("admin"), deleteUserAdmin);
module.exports = router;
