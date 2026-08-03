const Order = require("../../../model/orderSchema");
const Review = require("../../../model/reviewModel");
const Product = require("../../../model/productModel");

exports.getHeroStats = async (req, res) => {
  // Best seller — most-ordered product by total quantity, excluding cancelled orders
  const bestSellerAgg = await Order.aggregate([
    { $match: { orderStatus: { $ne: "cancelled" } } },
    { $unwind: "$items" },
    { $group: { _id: "$items.product", totalQuantity: { $sum: "$items.quantity" } } },
    { $sort: { totalQuantity: -1 } },
    { $limit: 1 },
  ]);

  let bestSeller = null;
  if (bestSellerAgg.length > 0) {
    const product = await Product.findById(bestSellerAgg[0]._id).select("productName productImage");
    if (product) {
      bestSeller = {
        productId: product._id,
        productName: product.productName,
        productImage: product.productImage,
      };
    }
  }

  // Average rating across every review, rounded to 1 decimal
  const ratingAgg = await Review.aggregate([{ $group: { _id: null, avgRating: { $avg: "$rating" } } }]);
  const avgRating = ratingAgg.length > 0 ? Math.round(ratingAgg[0].avgRating * 10) / 10 : null;

  // Distinct customers who have placed at least one order
  const distinctCustomers = await Order.distinct("user");
  const customerCount = distinctCustomers.length;

  res.status(200).json({
    message: "Hero stats fetched successfully",
    data: { bestSeller, avgRating, customerCount },
  });
};
