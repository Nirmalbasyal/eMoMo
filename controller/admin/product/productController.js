const Product = require('../../../model/productModel');
const fs = require('fs');

exports.createProduct = async (req, res) => { 
    // console.log(req.file); // check if file is received
  
        const file = req.file;
        let filepath
        if (!file) {
            return res.status(400).json({
                message: "Please upload a product image"
            });
         } else {
                filepath = req.file.filename 
            }
        
     
        const { productName, productPrice, productDescription, productStock, productStatus } = req.body;
        if (!productName || !productPrice || !productDescription || !productStock || !productStatus) {
            return res.status(400).json({
                message: "Please provide productName, productPrice, productDescription, productStock, and productStatus"
            });
        }
        // insert into the product collection/table
        await Product.create({
            productName,
            productPrice,
            productDescription,
            productStock,
            productStatus,
            productImage: process.env.BACKEND_URL + filepath
        })
        res.status(201).json({
            message: "Product created successfully"
        });

  
};



   exports.deleteProductById = async (req, res) => {
     const { id } = req.params;

     //fetch FIRST before deleting
     const oldData = await Product.findById(id);
     if (!oldData) {
       return res.status(404).json({
         message: "Product not found",
       });
     } 

     //delete the image file from uploads folder
     const oldProductImage = oldData.productImage; // http://localhost:3000/filename.jpg
     const lengthToCut = process.env.BACKEND_URL.length;
     const finalImgPathAfterCut = oldProductImage.slice(lengthToCut) // filename.jpg
     

     fs.unlink("./uploads/" + finalImgPathAfterCut, (err) => {
       if (err) {
         console.error("Error deleting old product image:", err);
       } else {
         console.log("Old product image deleted successfully");
       }
     });

     //now delete from DB after image is handled
     await Product.findByIdAndDelete(id);

     res.status(200).json({
       message: "Product deleted successfully",
     });
   };

    exports.updateProductById = async (req, res) => {
        const { id } = req.params;
        const { productName, productPrice, productDescription, productStock, productStatus } = req.body;
        if (!productName || !productPrice || !productDescription || !productStock || !productStatus) {
            return res.status(400).json({
                message: "Please provide productName, productPrice, productDescription, productStock, and productStatus"
            });
        }   
       const oldData = await Product.findById(id);
        if (!oldData) {
            return res.status(404).json({                                                               
                message: "Product not found"
            });
        }

        const oldProductImage = oldData.productImage;  //http://localhost:3000/1689876543210-product.jpg
        const lengthToCut = process.env.BACKEND_URL.length;
        const finalImgPathAfterCut = oldProductImage.slice(lengthToCut);  //1689876543210-product.jpg
        if (req.file && req.file.filename) {
            // delete the old product image from the uploads folder
            fs.unlink("./uploads/" + finalImgPathAfterCut, (err) => {
                if (err) {
                    console.error("Error deleting old product image:", err);
                } else {
                    console.log(" Old product image deleted successfully");
                }
            });
        }

        const datas = await Product.findByIdAndUpdate(id, {
            productName,
            productPrice,
            productDescription,
            productStock,
            productStatus,
            productImage: req.file ? process.env.BACKEND_URL + req.file.filename : oldProductImage
        },{
            new: true
        });
        res.status(200).json({
            message: "Product updated successfully",
            data : datas
        });

    }