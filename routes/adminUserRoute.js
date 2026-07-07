const router = require("express").Router();
const { getUsers } = require("../controller/admin/users/userController");
const isAuthenticated = require("../middleware/isAuthenticated");
const isAdmin = require("../middleware/isAdmin");
const catchAsync = require("../services/catchAsync");

router.route("/users").get(isAuthenticated, isAdmin, catchAsync(getUsers));

module.exports = router;