const Category = require("../../../model/categoryModel");
const Product = require("../../../model/productModel");

exports.createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Please provide a category name" });
  }

  const existing = await Category.findOne({ name: name.trim() });
  if (existing) {
    return res.status(409).json({ message: "This category already exists" });
  }

  const category = await Category.create({ name: name.trim() });
  res.status(201).json({ message: "Category created successfully", data: category });
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  // prevent deleting a category that's still assigned to products
  const inUse = await Product.findOne({ productCategory: category.name });
  if (inUse) {
    return res.status(409).json({
      message: "Cannot delete a category that's still assigned to products",
    });
  }

  await Category.findByIdAndDelete(id);
  res.status(200).json({ message: "Category deleted successfully" });
};
