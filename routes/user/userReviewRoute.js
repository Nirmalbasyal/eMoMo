
const router = require("express").Router();

const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../services/catchAsync");
const {
  createReview,
  getMyReviews,
  updateReview,
  deleteReview
} = require("../../controller/user/review/reviewController");

router.route('/my-reviews/').get(isAuthenticated, catchAsync(getMyReviews));
router.route("/reviews/:reviewId").patch(isAuthenticated, catchAsync(updateReview))
 .delete(isAuthenticated, catchAsync(deleteReview));  
router.route("/reviews/:productId").post(isAuthenticated, catchAsync(createReview))



module.exports = router;
