const Product = require('../../model/productModel');
exports.createProduct = async (req, res) => { 

     try {
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
            productStatus
        })
        res.status(201).json({
            message: "Product created successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
};