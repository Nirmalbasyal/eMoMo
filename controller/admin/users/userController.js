const User = require('../../../model/userModel');


exports.getUsers = async (req, res) => {

    const userId = req.user.id; // get the authenticated user from the request
    const users = await User.find({ _id: { $ne: userId } }).select("-__v");

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

// delete user api
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  // fetch user from DB using id from token

  if (!id) {
    return res.status(404).json({
      message: "Please provide a user id to delete",
    });
  }
  // fetch user from DB using id from token
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
 // delete the user
  await User.findByIdAndDelete(id);
  res.status(200).json({
    message: "User deleted successfully",
  });
};
