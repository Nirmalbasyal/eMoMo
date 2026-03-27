const router = require("express").Router();
const { registerUser, loginUser, forgotPassword } = require("../controller/auth/authController");
// routs here
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/forgotPassword").post(forgotPassword);

module.exports = router;