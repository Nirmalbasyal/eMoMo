const express = require("express");
const { connectDB } = require("./database/database");
const app = express();
const { registerUser, loginUser } = require("./controller/auth/authController");

// ROUTES HERE
const authRoute = require("./routes/authRoute");
const productRoute = require("./routes/productRoute");

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


app.use("", authRoute);
app.use("", productRoute);

const PORT = process.env.PORT 
// listen server
app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
})