const mongoose = require('mongoose');
const User = require('../model/userModel');
const adminSeeder = require('../adminSeeder');

exports.connectDB = async () => {
    // connect to MongoDB
    
     await mongoose.connect(process.env.MONGO_URI)
     console.log('Connected to MongoDB');

    //  admin Seeding function
   await adminSeeder();

}