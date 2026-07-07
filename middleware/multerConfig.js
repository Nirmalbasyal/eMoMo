const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedFileTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and GIF are allowed.'));
        }
        cb(null, 'uploads/'); // cb(error, success)
    },
    filename: function (req, file, cb) {
        cb(null,Date.now() + '-' + file.originalname); // cb(error, success)
}
});

module.exports = {
    multer,
    storage
}
