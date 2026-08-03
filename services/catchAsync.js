// catch asyncronous errors

module.exports = (func) => (req, res, next) => {
    return func(req, res, next).catch((err) => {
      
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    });
};