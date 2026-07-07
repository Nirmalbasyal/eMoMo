const User = require('../../../model/userModel');

exports.getUsers = async (req, res) => {
    const users = await User.find().select('-__v')
    if (users.length === 0) {
        return res.status(404).json({
            message: "No users found",
            data: []
        });
    } else {
        res.status(200).json({
            message: "Users fetched successfully",
            data: users
        });
    }
};