const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
    },
    productPrice: {
      type: Number,
      required: [true, "Product price is required"],
    },
    productDescription: {
      type: String,
      required: [true, "Product description is required"],
    },
    productCategory: {
      type: String,
      required: [true, "Product category is required"],
    },
    productStock: {
      type: Number,
      required: [true, "Product stock is required"],
    },
    productStatus: {
      type: String,
      enum: ["available", "unavailable"],
    },
    productImage: String,

    productImagePublicId: {
      type: String, // Cloudinary's internal ID for this image, used to delete it later
    },
  },

  { timestamps: true },
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;