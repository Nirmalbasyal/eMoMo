const User = require("../../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../../services/sendEmail");

exports.registerUser = async (req, res) => {
  const { email, phoneNumber, username, password } = req.body;

  // validate the user input
  if (!email || !phoneNumber || !username || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }
  // check if that email user already exists
  const userFound = await User.find({ userEmail: email });
  if (userFound.length > 0) {
    return res.status(400).json({
      message: "User with this email already exists",
    });
  }

  //  else
  await User.create({
    userEmail: email,
    userPhoneNumber: phoneNumber,
    userName: username,
    userPassword: bcrypt.hashSync(password, 10),
  });
  res.status(201).json({
    message: "User registered successfully",
  });
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }
  //  check if that email user exists or not
  const userFound = await User.find({ userEmail: email });
  if (userFound.length === 0) {
    return res.status(400).json({
      message: "User with this email does not exist",
    });
  }

  //    password check
  const isMatched = bcrypt.compareSync(password, userFound[0].userPassword);
  if (isMatched) {
    // generate token
    const token = jwt.sign({ id: userFound[0]._id }, process.env.SECRET_KEY, { expiresIn: "30d" });

    return res.status(200).json({
      message: "User logged in successfully",
      token: token,
    });
  } else {
    return res.status(400).json({
      message: "Invalid Password",
    });
  }
};

// forgot passsword
exports.forgotPassword = async (req,res)=>{
  const { email } = req.body;
  if(!email){
    return res.status(400).json({
      message: "Please provide your email",
    });
  }

  // check if that email user exists or not
  const userFound = await User.find({ userEmail: email });
  if (userFound.length === 0) {
    return res.status(400).json({
      message: "User with this email does not exist",
    });
  }
   
  // send otp to that email
  const otp = Math.floor(100000 + Math.random() * 900000);
  userFound[0].otp = otp;
  await userFound[0].save();
  
  await sendEmail({
    to: email,
    subject: "e-MoMo : Password Reset OTP",
    text: `Your OTP for password reset is ${otp}. Don't share this OTP with anyone. It will expire in 10 minutes.`,
  })
  res.json({
    message: "OTP sent to your email",
  })

}
