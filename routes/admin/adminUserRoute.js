const router = require("express").Router();
const { getUsers } = require("../../controller/admin/users/userController");
const isAuthenticated = require("../../middleware/isAuthenticated");
const isAdmin = require("../../middleware/isAdmin");
const catchAsync = require("../../services/catchAsync");
const { deleteUser } = require("../../controller/admin/users/userController");

router.route("/users").get(isAuthenticated, isAdmin, catchAsync(getUsers));
router.route("/users/:id").delete(isAuthenticated, isAdmin, catchAsync(deleteUser));

module.exports = router;