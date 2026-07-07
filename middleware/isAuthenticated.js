const Jwt = require('jsonwebtoken');
const isAuthenticated = (req, res, next) => {

  try {
    
  const authHeader = req.headers.authorization;

if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
        message: "Unauthorized. No token provided."
    });
    }
  // Handle "Bearer token"
  const token = authHeader.split(" ")[1];

  // pathayo vaney k garney ta
  // verify if the token is valid or not
  Jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        message: "Unauthorized. Invalid token.",
      });
    }
      req.user = decoded;
    next();
    
  });
} catch (err) {
    res.status(500).json({
      message: "Internal server error.",
      error: err.message,
    });
  }
};
module.exports = isAuthenticated;