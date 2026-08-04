const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// configure the Cloudinary SDK with your account credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// instead of saving files to a local "uploads/" folder, this storage engine
// uploads the file directly to Cloudinary and gives us back a permanent URL
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "emomo-products", // groups all product images under one folder in your Cloudinary account
    allowed_formats: ["jpeg", "jpg", "png", "gif"], // same file types you were validating manually before
  },
});

module.exports = {
  multer,
  storage,
};


// const multer = require('multer');

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {

//         const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
//         if (!allowedFileTypes.includes(file.mimetype)) {
//             return cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and GIF are allowed.'));
//         }
//         cb(null, 'uploads/'); // cb(error, success)
//     },
//     filename: function (req, file, cb) {
//         cb(null,Date.now() + '-' + file.originalname); // cb(error, success)
// }
// });

// module.exports = {
//     multer,
//     storage
// }
