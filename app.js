const express = require("express");
const { connectDB } = require("./database/database");
const app = express();
const User = require('./model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// register user api
app.post('/register', async (req, res) => {
   const{ email, phoneNumber, username, password } = req.body;

   // validate the user input
   if(!email || !phoneNumber || !username || !password) {
    return res.status(400).json({ 
        message: 'All fields are required' });
   }
// check if that email user already exists
const existingUser = await User.find({ userEmail: email });
    if(existingUser.length > 0) {
    return res.status(400).json({ 
        message: 'User with this email already exists' });
   }

    //  else
    await User.create({
        userEmail: email,
        userPhoneNumber: phoneNumber,
        userName: username,
        userPassword: bcrypt.hashSync(password, 10),
    })
    res.status(201).json({ 
        message: 'User registered successfully' });

});

// login user api
app.post("/login" , async(req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ 
            message: 'All fields are required' });
        }
    //  check if that email user exists or not
    const existingUser = await User.find({ userEmail: email });
    if(existingUser.length === 0) {
        return res.status(400).json({ 
            message: 'User with this email does not exist' });
       }

    //    password check
    const isMatched = bcrypt.compareSync(password,existingUser[0].userPassword);
    if(isMatched) {
        // generate token
        const token = jwt.sign({id : existingUser[0]._id}, process.env.SECRET_KEY, { expiresIn: '30d'});
      
       return res.status(200).json({ 
            message: 'User logged in successfully',
            token: token
        });
    } else {
        return res.status(400).json({ 
            message: 'Invalid Password' });
    }

});


const PORT = process.env.PORT 
// listen server
app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
})