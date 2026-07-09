const Review = require("../../../model/reviewModel");
const Product = require("../../../model/productModel");
const User = require("../../../model/userModel");

exports.createReview = async (req, res) => {
  const { rating, message } = req.body;
  const { productId } = req.params;
  const userId = req.user.id; // get the authenticated user from the request

  if (!productId || !rating || !message) {
    return res.status(400).json({
      message: "Please provide productId, rating, and message",
    });
  }

  // check if that product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }
  // insert into the review collection/table
  await Review.create({
    productId,
    userId,
    rating,
    message,
  });

  res.status(201).json({
    message: "Review created successfully",
  });
};
// get reviews by product ID
// exports.getReviewsByProductId = async (req, res) => {
//   const { productId } = req.params;
//   if (!productId) {
//     return res.status(400).json({
//       message: "Please provide a productId",
//     });
//   }
//   const productExists = await Product.findById(productId);
//   if (!productExists) {
//     return res.status(404).json({
//       message: "Product with that ID doesn't exist",
//     });
//   }
//   const reviews = await Review.find({ productId }).populate("userId");
//   if (reviews.length === 0) {
//     return res.status(404).json({
//       message: "No reviews for this product",
//     });
//   }
//   res.status(200).json({
//     message: "Reviews fetched successfully",
//     data: reviews,
//   });
// };

// get reviews by user ID
exports.getMyReviews = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(400).json({
      message: "Please provide a userId",
    });
  }
  const userExists = await User.findById(userId);
  if (!userExists) {
    return res.status(404).json({
      message: "User with that ID doesn't exist",
    });
  }
  const reviews = await Review.find({ userId });
  if (reviews.length === 0) {
    return res.status(404).json({
      message: "You have not given any reviews yet",
      reviews: [],
    });
  }
  res.status(200).json({
    message: "Reviews fetched successfully",
    data: reviews,
  });
};

// delete review api
exports.deleteReview = async (req, res) => {
  const reviewId = req.params.reviewId;
  if (!reviewId) {
    return res.status(400).json({
      message: "Please provide a reviewId",
    });
  }
  const review = await Review.findById(reviewId);
  if (!review) {
    return res.status(404).json({
      message: "Review not found",
    });
  }

  // check if the user is the owner of the review or an admin
  if (review.userId.toString() !== req.user.id && req.user.userRole !== "admin") {
    return res.status(403).json({
      message: "You are not authorized to delete this review",
    });
  }

  await Review.findByIdAndDelete(reviewId);
  res.status(200).json({
    message: "Review deleted successfully",
  });
};

// update review api
exports.updateReview = async (req, res) => {
  const reviewId = req.params.reviewId;
  const { rating, message } = req.body;

  if (!reviewId) {
    return res.status(400).json({
      message: "Please provide a reviewId",
    });
  }

  if (!rating && !message) {
    return res.status(400).json({
      message: "Please provide rating or message to update",
    });
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    return res.status(404).json({
      message: "Review not found",
    });
  }

  if (review.userId.toString() !== req.user.id) {
    return res.status(403).json({
      message: "You are not authorized to update this review",
    });
  }

  if (rating) {
    review.rating = rating;
  }

  if (message) {
    review.message = message;
  }

  await review.save();

  res.status(200).json({
    message: "Review updated successfully",
    data: review,
  });
};
