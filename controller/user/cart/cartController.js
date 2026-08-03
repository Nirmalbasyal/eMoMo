const e = require("express");
const Product = require("../../../model/productModel");
const User = require("../../../model/userModel");

exports.addToCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;
  // console.log("User ID:", userId);
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

  const productInCart = user.cart.find((item) => item.product.toString() === productId);
  if (productInCart) {
    productInCart.quantity += 1;
  } else {
    user.cart.push({
      product: productId,
      quantity: 1,
    });
  }
  await user.save();
  const updatedUser = await User.findById(userId).populate("cart.product");
  res.status(200).json({
    message: "Product added to cart successfully",
    data: updatedUser.cart,
  });
};
// get my cart items
exports.getMyCartItems = async (req, res) => {
  const userId = req.user.id;
  const userData = await User.findById(userId).populate({
    path: "cart.product",
    select: "-__v -productStatus -productStock -createdAt -updatedAt",
  });

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
  const productInCart = user.cart.some((item) => item.product.toString() === productId);
  if (!productInCart) {
    return res.status(404).json({
      message: "Product is not in your cart",
    });
  }
  // remove product from cart
  user.cart = user.cart.filter((item) => item.product.toString() !== productId);
  await user.save();
  res.status(200).json({
    message: "Product removed from cart successfully",
    data: user.cart,
  });
};

// decrease quantity by 1, removes the item completely once it hits 0
exports.decreaseCartItem = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  const user = await User.findById(userId);
  const item = user.cart.find((i) => i.product.toString() === productId);

  if (!item) {
    return res.status(404).json({ message: "Product is not in your cart" });
  }

  if (item.quantity <= 1) {
    // quantity would drop to 0, so just remove the item instead
    user.cart = user.cart.filter((i) => i.product.toString() !== productId);
  } else {
    item.quantity -= 1;
  }

  await user.save();
  await user.populate("cart.product");

  res.status(200).json({ message: "Cart updated", data: user.cart });
};

// empty out the entire cart at once, used by the "clear cart" button
exports.clearCart = async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);

  user.cart = [];
  await user.save();

  res.status(200).json({ message: "Cart cleared", data: [] });
};
