const Product = require("../../../model/productModel");
const { v2: cloudinary } = require("cloudinary");

exports.createProduct = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({
      message: "Please upload a product image",
    });
  }

  const { productName, productPrice, productDescription, productStock, productCategory, productStatus } = req.body;
  if (!productName || !productPrice || !productDescription || !productCategory || !productStock || !productStatus) {
    return res.status(400).json({
      message:
        "Please provide productName, productPrice, productDescription, productCategory, productStock, and productStatus",
    });
  }

  // insert into the product collection/table
  const product = await Product.create({
    productName,
    productPrice,
    productDescription,
    productCategory,
    productStock,
    productStatus,
    // Cloudinary's storage engine already gives us the full, permanent
    // image URL on req.file.path — no more manually building it with
    // BACKEND_URL + filename, which was the source of the earlier bugs
    productImage: file.path,
    // Cloudinary's internal ID for this file, needed later to delete it
    productImagePublicId: file.filename,
  });

  res.status(201).json({
    message: "Product created successfully",
    data: product,
  });
};

exports.deleteProductById = async (req, res) => {
  const { id } = req.params;

  // fetch FIRST before deleting
  const oldData = await Product.findById(id);
  if (!oldData) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  // delete the image from Cloudinary using its public_id — much simpler
  // and more reliable than the old fs.unlink + string-slicing approach,
  // since Cloudinary tracks the exact file for us via public_id
  if (oldData.productImagePublicId) {
    try {
      await cloudinary.uploader.destroy(oldData.productImagePublicId);
      console.log("Old product image deleted successfully");
    } catch (err) {
      console.error("Error deleting old product image from Cloudinary:", err);
      // not fatal — continue with deleting the product even if image cleanup fails
    }
  }

  // now delete from DB after image is handled
  await Product.findByIdAndDelete(id);

  res.status(200).json({
    message: "Product deleted successfully",
  });
};

exports.updateProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, productPrice, productDescription, productCategory, productStock, productStatus } = req.body;
    if (!productName || !productPrice || !productDescription || !productCategory || !productStock || !productStatus) {
      return res.status(400).json({
        message:
          "Please provide productName, productPrice, productDescription, productCategory, productStock, and productStatus",
      });
    }

    const oldData = await Product.findById(id);
    if (!oldData) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // if a new image was uploaded, delete the old one from Cloudinary
    if (req.file && oldData.productImagePublicId) {
      try {
        await cloudinary.uploader.destroy(oldData.productImagePublicId);
        console.log("Old product image deleted successfully");
      } catch (err) {
        console.error("Error deleting old product image from Cloudinary:", err);
      }
    }

    const datas = await Product.findByIdAndUpdate(
      id,
      {
        productName,
        productPrice,
        productDescription,
        productCategory,
        productStock,
        productStatus,
        productImage: req.file ? req.file.path : oldData.productImage,
        productImagePublicId: req.file ? req.file.filename : oldData.productImagePublicId,
      },
      {
        returnDocument: "after",
      },
    );

    res.status(200).json({
      message: "Product updated successfully",
      data: datas,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      message: "An error occurred while updating the product",
      error: error.message,
    });
  }
};
