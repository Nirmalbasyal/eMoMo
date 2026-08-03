const Product = require("../../model/productModel");
const Review = require("../../model/reviewModel");

exports.getAllProducts = async (req, res) => {
  const products = await Product.find();
  if (products.length === 0) {
    return res.status(404).json({
      message: "No products found",
      data: [],
    });
  } else {
    res.status(200).json({
      message: "Products retrieved successfully",
      data: products,
    });
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      message: "Please provide product id",
    });
  }

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      message: "Product not found",
      data: {
        product: null,
        productReviews: [],
      },
    });
  }

  const productReviews = await Review.find({ productId: id })
    .populate("userId", "userName userEmail")
    .sort({ createdAt: -1 });

  res.status(200).json({
    message: "Product retrieved successfully",
    data: {
      product,
      productReviews,
    },
  });
};