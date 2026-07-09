const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({

    userEmail: {
        type: String,
        required: [true, 'User email is required'],
        unique: true,
        
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
        minlength: [8, 'Password must be at least 8 characters long'],
        // select: false, // this will hide the password field when fetching user data
    },

    userRole: {
        type: String,
        enum: ['admin', 'customer'],
        default: 'customer',
    },

    otp: {
        type: Number,
    },

    otpCreatedAt: {
        type: Date,
    },

    isOtpVerified: {
        type: Boolean,
        default: false,
    },
    otpVerifiedAt: {
        type: Date,
    },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
