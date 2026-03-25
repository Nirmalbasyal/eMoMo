const mongoose = require('mongoose');

exports.connectDB = async () => {
    // connect to MongoDB
    
     await mongoose.connect(process.env.MONGO_URI)
     console.log('Connected to MongoDB');
}