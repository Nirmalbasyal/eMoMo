const router = require("express").Router();
const { getOrders, updateOrderStatus, deleteOrder } = require("../../controller/admin/order/orderController");
const isAuthenticated = require("../../middleware/isAuthenticated");
const isAdmin = require("../../middleware/isAdmin");
const catchAsync = require("../../services/catchAsync");

router.route("/").get(isAuthenticated, isAdmin, catchAsync(getOrders));
router.route("/:orderId").patch(isAuthenticated, isAdmin, catchAsync(updateOrderStatus)).delete(isAuthenticated, isAdmin, catchAsync(deleteOrder));

module.exports = router;