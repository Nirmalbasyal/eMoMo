const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({

    userEmail: {
        type: String,
        required: [true, 'User email is required'],
        
    },

    userPhoneNumber: {
        type: Number,
        required: [true, 'User phone number is required'],
    },

    userName: {
        type: String,
        required: [true, 'User name is required'],
    },

    userPassword: {
        type: String,
        required: [true, 'User password is required'],
    },

    userRole: {
        type: String,
        enum: ['admin', 'customer'],
        default: 'customer',
    },


});

module.exports = mongoose.model('User', userSchema);
