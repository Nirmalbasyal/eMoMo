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
  const userData = await User.create({
    userEmail: email,
    userPhoneNumber: phoneNumber,
    userName: username,
    userPassword: bcrypt.hashSync(password, 10),
  });
  res.status(201).json({
    message: "User registered successfully",
    data: userData,
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
  const userFound = await User.find({ userEmail: email }).select("+userPassword"); // explicitly select the password field
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
      data: userFound,
      token,
    });
  } else {
    return res.status(400).json({
      message: "Invalid Password",
    });
  }
};

// forgot passsword
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Please provide your email",
    });
  }

  // Check if user exists
  const userFound = await User.findOne({ userEmail: email });

  if (!userFound) {
    return res.status(400).json({
      message: "User with this email does not exist",
    });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  // Update only OTP fields (avoids validating the whole document)
  await User.findByIdAndUpdate(userFound._id, {
    otp,
    otpCreatedAt: new Date(),
    isOtpVerified: false,
    otpVerifiedAt: null,
  });

  // Send OTP email
  await sendEmail({
    to: userFound.userEmail,
    subject: "e-MoMo : Password Reset OTP",
    text: `Your OTP for password reset is ${otp}. Don't share this OTP with anyone. It will expire in 10 minutes.`,
  });

  return res.status(200).json({
    message: "OTP sent to your email",
  });
};
// verify otp
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        message: "Please provide your email and otp",
      });
    }
    // check if that otp is correct or not for that email
    const userFound = await User.findOne({ userEmail: email });
    if (!userFound) {
      return res.status(400).json({
        message: "User with this email does not exist",
      });
    }

    // Check if OTP has expired
    const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes in milliseconds
    const otpAge = Date.now() - new Date(userFound.otpCreatedAt).getTime();

    if (otpAge > OTP_EXPIRY_MS) {
      userFound.otp = null;
      userFound.otpCreatedAt = null;
      await userFound.save();
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    //  check if otp is correct or not
    if (userFound.otp !== Number(otp)) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }
    res.status(200).json({
      message: "OTP verified successfully",
    });
    userFound.otp = null;
    userFound.otpCreatedAt = null;
    userFound.isOtpVerified = true;
    userFound.otpVerifiedAt = new Date();
    await userFound.save();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;
  if (!email || !newPassword || !confirmPassword) {
    return res.status(400).json({
      message: "Please provide email, new password and confirm password",
    });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      message: "New password and confirm password do not match",
    });
  }
  // check if that email user exists or not
  const userFound = await User.findOne({ userEmail: email });
  if (!userFound) {
    return res.status(400).json({
      message: "User with this email does not exist",
    });
  }

  if (!userFound.isOtpVerified || Date.now() > userFound.otpVerifiedAt.getTime() + 10 * 60 * 1000) {
    return res.status(400).json({
      message: "Session expired. Please verify OTP again.",
    });
  }
  userFound.userPassword = bcrypt.hashSync(newPassword, 10);
  userFound.isOtpVerified = false; // Reset OTP verification status
  await userFound.save();
  res.status(200).json({
    message: "Password reset successfully",
  });
};
