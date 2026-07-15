const e = require("express");
const Product = require("../../../model/productModel");
const User = require("../../../model/userModel");

exports.addToCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;
  console.log("User ID:", userId);
  if (!productId) {
    return res.status(400).json({
      message: "Please provide product id",
    });
  }

  const productExists = await Product.findById(productId);
  if (!productExists) {
    return res.status(404).json({
      message: "No product found with that provided id",
    });
  }
  const user = await User.findById(userId);
  user.cart.push(productId);
    await user.save();
    res.status(200).json({
      message: "Product added to cart successfully",
      data: user.cart,
    });
  
  

}
// get my cart items
exports.getMyCartItems = async (req, res) => {
  const userId = req.user.id;
  const userData = await User.findById(userId).populate({
    path: "cart",
    select: "-__v -productStatus -productStock -createdAt -updatedAt",

  })
 
  res.status(200).json({
    message: "Cart items retrieved successfully",
    data: userData.cart,
  });
};

// delete cart item 
exports.deleteCartItem = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;
  if (!productId) {
    return res.status(400).json({
      message: "Please provide product id",
    });
  }
  const productExists = await Product.findById(productId);
  if (!productExists) {
    return res.status(404).json({
      message: "No product found with that provided id",
    });
  }
  // get logged-in user
  const user = await User.findById(userId);
  // Check if product is in cart
  const productInCart = user.cart.includes(productId);
  if (!productInCart) {
    return res.status(404).json({
      message: "Product is not in your cart",
    });
  }
  // remove product from cart
  user.cart = user.cart.filter((pId) => pId.toString() !== productId);
  await user.save();
  res.status(200).json({
    message: "Product removed from cart successfully",
    data: user.cart,
  });
};
