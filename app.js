// tell node to use dotenv
require("dotenv").config();
// OR
// const env = require('dotenv');
// env.config();

const express = require("express");
const { connectDB } = require("./database/database");
const app = express();
const { registerUser, loginUser } = require("./controller/auth/authController");

const { Server } = require("socket.io");
const cors = require("cors");
const Jwt = require("jsonwebtoken");
const User = require("./model/userModel");
const { initSocket } = require("./services/socket");

// ROUTES HERE
const authRoute = require("./routes/authRoute");
const productRoute = require("./routes/productRoute");
const adminUserRoute = require("./routes/admin/adminUserRoute");
const userReviewRoute = require("./routes/user/userReviewRoute");
const profileRoute = require("./routes/user/profileRoute");
const cartRoute = require("./routes/user/cartRoute");
const orderRoute = require("./routes/user/orderRoute");
const adminOrderRoute = require("./routes/admin/adminOrderRoute");
const paymentRoute = require("./routes/user/paymentRoute");
const statsRoutes = require("./routes/user/statsRoutes");
app.use(cors({ origin: "*" }));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// database connection
connectDB();

// test api to check if the server is live or not
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is alive!",
  });
});

app.use(express.static("uploads")); // telling node js to give access to the uploads folder to the public

app.use("/api/auth", authRoute);
app.use("/api", productRoute);
app.use("/api/admin", adminUserRoute);
app.use("/api", userReviewRoute);
app.use("/api", profileRoute);
app.use("/api/cart", cartRoute);
app.use("/api/order", orderRoute);
app.use("/api/admin/orders", adminOrderRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/stats", statsRoutes);

// global error handler — catches errors passed via next(err) that aren't
// handled anywhere else (e.g. multer/Cloudinary upload failures), and
// returns JSON instead of Express's default HTML error page
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  console.error(err.stack); // full stack trace, more useful than [object Object]
  res.status(500).json({
    message: "Internal server error",
    error: err.message,
  });
});

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

initSocket(server);
