const { initiateKhaltiPayment, verifyPidx } = require("../../controller/user/payment/paymentController");
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../services/catchAsync");

const router = require("express").Router();

router.route("/initiate").post(isAuthenticated, initiateKhaltiPayment);
router.route("/verifypidx").post(verifyPidx);

module.exports = router;