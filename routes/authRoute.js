const router = require("express").Router();
const { registerUser, loginUser } = require("../controller/auth/authController");

// routs here
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

module.exports = router