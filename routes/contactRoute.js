const router = require("express").Router();
const catchAsync = require("../services/catchAsync");
const { sendContactMessage } = require("../controller/global/contactController");

router.route("/contact").post(catchAsync(sendContactMessage));

module.exports = router;
