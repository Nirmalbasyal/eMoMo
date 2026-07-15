const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    items: [{
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Product ID is required'],
        }
    }],

    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
    },

    shippingAddress: {
        type: String,
        required: [true, 'Shipping address is required'],
    },

    orderStatus: {
        type: String,
        enum: ['pending', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },

    paymentDetails: {
        pidx: {
            type: String,
        },
        paymentMethod: {
            type: String,
            enum: ['COD', 'Khalti'],
            required: [true, 'Payment method is required'],
        },
        paymentStatus: {    
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending',
        },
    },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);