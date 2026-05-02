const User = require("../model/userModel");

const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. User not authenticated.",
      });
    }

    // fetch user from DB using id from token
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    console.log("user from DB:", user); // check user details

    if (user.userRole !== "admin") {
      return res.status(403).json({
        message: "Forbidden. Only admins can access this resource.",
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = isAdmin;
