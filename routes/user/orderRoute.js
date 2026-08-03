const express = require("express");
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
  cancelOrder,
  deleteMyOrder,
  updateMyOrder,
  updatePaymentStatus,
} = require("../../controller/user/order/orderController");
const isAuthenticated = require("../../middleware/isAuthenticated");
const isAdmin = require("../../middleware/isAdmin");
const catchAsync = require("../../services/catchAsync");

router.route("/").post(isAuthenticated, catchAsync(createOrder));
router.route("/all").get(isAuthenticated, isAdmin, catchAsync(getAllOrders));
router.route("/my").get(isAuthenticated, catchAsync(getMyOrders));
router.route("/cancel/:orderId").patch(isAuthenticated, catchAsync(cancelOrder));
router
  .route("/:orderId")
  .get(isAuthenticated, isAdmin, catchAsync(getOrderById))
  .patch(isAuthenticated, catchAsync(updateMyOrder))
  .delete(isAuthenticated, catchAsync(deleteMyOrder));
router.route("/:orderId/status").patch(isAuthenticated, isAdmin, catchAsync(updateOrderStatus));
router.route("/:orderId/payment-status").patch(isAuthenticated, isAdmin, catchAsync(updatePaymentStatus));

module.exports = router;
