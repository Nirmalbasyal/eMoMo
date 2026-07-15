const express = require("express");
const { connectDB } = require("./database/database");
const app = express();
const { registerUser, loginUser } = require("./controller/auth/authController");





// ROUTES HERE
const authRoute = require("./routes/authRoute");
const productRoute = require("./routes/productRoute");
const adminUserRoute = require("./routes/admin/adminUserRoute");
const userReviewRoute = require("./routes/user/userReviewRoute");
const profileRoute = require("./routes/user/profileRoute");
const cartRoute = require("./routes/user/cartRoute");
const orderRoute = require("./routes/user/orderRoute")
const adminOrderRoute = require("./routes/admin/adminOrderRoute")
const paymentRoute = require("./routes/user/paymentRoute")

// Routes end here

// tell node to use dotenv
require('dotenv').config();
// OR
// const env = require('dotenv');
// env.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// database connection
connectDB();

// test api to check if the server is live or not
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Server is alive!' });
});



app.use( express.static("uploads")); // telling node js to give access to the uploads folder to the public


app.use("", authRoute);
app.use("/api", productRoute);
app.use("/api/admin", adminUserRoute);
app.use("/api", userReviewRoute);
app.use("/api", profileRoute);
app.use("/api/cart", cartRoute);
app.use("/api/order", orderRoute);
app.use("/api/admin/orders", adminOrderRoute);
app.use("/api/payment", paymentRoute);


const PORT = process.env.PORT 
// listen server
app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
})

