const router = require("express").Router();
const isAuthenticated = require("../middleware/isAuthenticated");
const isAdmin = require("../middleware/isAdmin");
const catchAsync = require("../services/catchAsync");
const { getCategories } = require("../controller/global/globalController");
const { createCategory, deleteCategory } = require("../controller/admin/product/categoryController");

router.route("/categories").get(catchAsync(getCategories)).post(isAuthenticated, isAdmin, catchAsync(createCategory));

router.route("/categories/:id").delete(isAuthenticated, isAdmin, catchAsync(deleteCategory));

module.exports = router;
