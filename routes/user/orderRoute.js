const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  cancelOrder,
  deleteMyOrder,
  updateMyOrder,
} = require("../../controller/user/order/orderController");
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../services/catchAsync");


router.route("/").post(isAuthenticated, catchAsync(createOrder));
router.route("/my").get(isAuthenticated, catchAsync(getMyOrders));
router.route("/cancel/:orderId").patch(isAuthenticated, catchAsync(cancelOrder));
router.route("/:orderId").patch(isAuthenticated, catchAsync(updateMyOrder)).delete(isAuthenticated, catchAsync(deleteMyOrder));


module.exports = router;
