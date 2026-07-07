const router = require("express").Router();
const { createProduct } = require("../controller/admin/productController");
const isAuthenticated = require("../middleware/isAuthenticated");
const isAdmin = require("../middleware/isAdmin");
const { multer, storage } = require("../middleware/multerConfig");
const { getAllProducts, getProductById } = require("../controller/admin/productController");
const catchAsync = require("../services/catchAsync");
const { deleteProductById } = require("../controller/admin/productController");
const { updateProductById } = require("../controller/admin/productController");

const upload = multer({ storage: storage });

router.route("/products")
.post(isAuthenticated, isAdmin, upload.single('productImage'), catchAsync(createProduct))
.get(catchAsync(getAllProducts));

router.route("/products/:id")
.get(catchAsync(getProductById))
.delete(isAuthenticated, isAdmin, catchAsync(deleteProductById))
.patch(isAuthenticated, isAdmin, upload.single('productImage'), catchAsync(updateProductById));

module.exports = router;
