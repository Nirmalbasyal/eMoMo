
const router = require("express").Router();

const isAuthenticated = require("../middleware/isAuthenticated");
const catchAsync = require("../services/catchAsync");
const { createReview, deleteReview, getReviewsByProductId } = require("../controller/user/userController");



// router.route('/reviews')
router.route("/reviews/:productId").get(isAuthenticated, catchAsync(getReviewsByProductId))
.post(isAuthenticated, catchAsync(createReview))
.delete(isAuthenticated, catchAsync(deleteReview));

module.exports = router;
