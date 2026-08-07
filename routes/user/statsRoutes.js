const express = require("express");
const router = express.Router();
const { getHeroStats, getPopularProducts } = require("../../controller/user/stat/statsController");
const catchAsync = require("../../services/catchAsync");

router.route("/hero").get(catchAsync(getHeroStats)); // public, no auth needed
router.route("/popular-products").get(catchAsync(getPopularProducts)); // public, no auth needed

module.exports = router;
