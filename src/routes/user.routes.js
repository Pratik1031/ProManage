const express = require("express");
const router = express.Router();
const user_controller = require("../controllers/user.controllers");
const verifyJWT = require("../middlewares/auth.middleware");

// Public Routes
router.route("/").get(user_controller.getUsers_data);
router.route("/register").post(user_controller.register);
router.route("/login").post(user_controller.login_user);

// Protected Routes
router.route("/logout").post(verifyJWT, user_controller.logout_user);
router.route("/prefilled").get(verifyJWT, user_controller.particular_user);
router.route("/change").post(verifyJWT, user_controller.update_user);

module.exports = router;
