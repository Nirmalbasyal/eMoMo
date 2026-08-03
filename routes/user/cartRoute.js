const { addToCart, getMyCartItems, deleteCartItem, decreaseCartItem, clearCart } = require("../../controller/user/cart/cartController");
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../services/catchAsync");

const router = require("express").Router();

// routes for single cart item
router
  .route("/:productId")
  .post(isAuthenticated, catchAsync(addToCart)) // add product, or +1 if already in cart
  .delete(isAuthenticated, catchAsync(deleteCartItem)) // remove a item completely
  .patch(isAuthenticated, catchAsync(decreaseCartItem));   // -1, removes item if it reaches 0

// routes for the whole cart
router.route("/")
.get(isAuthenticated, catchAsync(getMyCartItems))  // fetch full cart

.delete(isAuthenticated, catchAsync(clearCart));  // empty entire cart

module.exports = router;