const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({

    productName: {
        type: String,
        required: [true, 'Product name is required'],
    },  
    productPrice: {
        type: Number,
        required: [true, 'Product price is required'],
    },
    productDescription: {
        type: String,
        required: [true, 'Product description is required'],
    },
    productStock: {
        type: Number,
        required: [true, 'Product stock is required'],
    },
    productStatus: {
        type: String,
        enum: ['available', 'unavailable']
    },  

}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;