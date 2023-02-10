const User = require("../models/users");
const ErrorHandler = require("../utils/errorHandle");
const catchAssyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require('../utils/jwtToken')


// register a new user => /api/v1/register
exports.registerUser = catchAssyncErrors(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  //Create JWT Token
  //   const token = user.getJwtToken();
  sendToken(user, 200, res);
  //   res.status(200).json({
  //     success: true,
  //     message: "User registered",
  //     token: token,
  //     // data:user
  //   });
});

// get list of users user => /api/v1/users
exports.getAllUsers = catchAssyncErrors(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    result: users.length,
    data: users,
  });
});

// Login user => /aapi/v1/login
exports.loginUser = catchAssyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email or passowrd is not provided{
  if (!email || !password) {
    return next(new ErrorHandler("Please provide credentials", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  // Check if password is correct
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

//Create and send jwt token
//   const token = user.getJwtToken();
 sendToken(user,200,res)
//   res.status(200).json({
//     success: true,
//     token: token,
//   });
});
