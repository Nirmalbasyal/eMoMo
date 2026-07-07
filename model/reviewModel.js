const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const reviewSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:[true, 'User ID is required']
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required'],
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        default: 1,
        min: 1,
        max: 5
    },
    message: {
        type: String,
        required: [true, 'Review message is required'],
    }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
