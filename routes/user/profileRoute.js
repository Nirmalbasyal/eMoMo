const router = require("express").Router();
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../services/catchAsync");
const { getMyProfile, updateMyProfile, deleteMyProfile, updateMyPassword } = require("../../controller/user/profile/profileController");

router.route("/profile")
    .get(isAuthenticated, catchAsync(getMyProfile))
    .patch(isAuthenticated, catchAsync(updateMyProfile))
    .delete(isAuthenticated, catchAsync(deleteMyProfile));

router.route("/profile/password").patch(isAuthenticated, catchAsync(updateMyPassword));

module.exports = router;
