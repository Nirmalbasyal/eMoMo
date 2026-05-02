const router = require("express").Router();
const { createProduct } = require("../controller/admin/productController");
const isAuthenticated = require("../middleware/isAuthenticated");
const isAdmin = require("../middleware/isAdmin");

router.route("/createProduct").post(isAuthenticated, isAdmin, createProduct);

module.exports = router;
