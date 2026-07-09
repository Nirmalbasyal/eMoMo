const User = require('../../../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

// get my profile controller
exports.getMyProfile = async (req, res) => {
    const userId = req.user.id
    const myProfile = await User.findById(userId).select('-userPassword');
    // send response
    res.status(200).json({
        data : myProfile,
        message: "Profile fetched successfully"
    });
}


// update my profile controller
exports.updateMyProfile = async (req, res) => {
    const userId = req.user.id;
    const { userName, userEmail, userPhoneNumber } = req.body;
    // update profile
    const updatedProfile = await User.findByIdAndUpdate(userId, { userName, userEmail, userPhoneNumber },
        { 
            runValidators: true,  // to run validators on update
            new: true 

        })
    // send response
    res.status(200).json({
        message: "Profile updated successfully",
        data: updatedProfile
    });
}

// delete my profile controller
exports.deleteMyProfile = async (req, res) => {
    const userId = req.user.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({
        message: "Profile deleted successfully",
        data: null
    });
}

// update my password controller
exports.updateMyPassword = async (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
            message: "Please provide all required fields"
        });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            message: "New password and confirm new password do not match"
        });
    }

    // taking hash password from database
    const userData = await User.findById(userId)
    const hashedOldPassword = userData.userPassword;
    // check if old password is correct
    const isOldPasswordCorrect = await bcrypt.compare(oldPassword, hashedOldPassword);
    if (!isOldPasswordCorrect) {
        return res.status(400).json({
            message: "Old password did not match"
        });
    }
    // if matched
    userData.userPassword = bcrypt.hashSync(newPassword, 10);
    await userData.save();

 // after saving new password
userData.userPassword = bcrypt.hashSync(newPassword, 10);
await userData.save();

// generate new token
const newToken = jwt.sign({ id: userData._id, email: userData.userEmail }, process.env.SECRET_KEY, { expiresIn: "30d" });

res.status(200).json({
  message: "Password updated successfully",
  data: newToken, // send new token to frontend
});

}
    
    
