const router = require("express").Router();
const { registerUser, loginUser, forgotPassword, verifyOtp, resetPassword, } = require("../controller/auth/authController");
const catchAsync = require("../services/catchAsync");
// routs here
router.route("/register").post(catchAsync(registerUser));
router.route("/login").post(catchAsync(loginUser));
router.route("/forgotPassword").post(catchAsync(forgotPassword));
router.route("/verifyOtp").post(catchAsync(verifyOtp));
router.route("/resetPassword").post(catchAsync(resetPassword));


module.exports = router;