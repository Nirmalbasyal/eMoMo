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

exports.getPopularProducts = async (req, res) => {
  // Rank products by total quantity ordered, excluding cancelled orders
  const orderAgg = await Order.aggregate([
    { $match: { orderStatus: { $ne: "cancelled" } } },
    { $unwind: "$items" },
    { $group: { _id: "$items.product", totalQuantity: { $sum: "$items.quantity" } } },
    { $sort: { totalQuantity: -1 } },
    { $limit: 8 },
  ]);

  let popularProductIds = orderAgg.map((o) => o._id);
  let products = [];

  if (popularProductIds.length > 0) {
    const found = await Product.find({ _id: { $in: popularProductIds } }).select(
      "productName productImage productPrice productDescription productCategory",
    );

    // preserve the ranking order from the aggregation ($in doesn't guarantee order)
    products = popularProductIds.map((id) => found.find((p) => p._id.toString() === id.toString())).filter(Boolean);
  }

  // not enough order history yet — top up with highest-rated products instead
  if (products.length < 8) {
    const ratingFallback = await Review.aggregate([
      { $group: { _id: "$product", avgRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } },
      { $match: { _id: { $nin: popularProductIds }, reviewCount: { $gte: 1 } } },
      { $sort: { avgRating: -1 } },
      { $limit: 8 - products.length },
    ]);

    const fallbackIds = ratingFallback.map((r) => r._id);
    const fallbackProducts = await Product.find({ _id: { $in: fallbackIds } }).select(
      "productName productImage productPrice productDescription productCategory",
    );

    // attach avgRating so the frontend can show it without another lookup
    const fallbackWithRating = fallbackProducts.map((p) => {
      const match = ratingFallback.find((r) => r._id.toString() === p._id.toString());
      return { ...p.toObject(), avgRating: Math.round(match.avgRating * 10) / 10 };
    });

    products = [...products, ...fallbackWithRating];
  }

  // if there's STILL nothing (brand new store, no orders, no reviews), just show newest products
  if (products.length === 0) {
    products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .select("productName productImage productPrice productDescription productCategory");
  }

  res.status(200).json({
    message: "Popular products fetched successfully",
    data: products,
  });
};
