const User = require("../models/users");
const ErrorHandler = require("../utils/errorHandle");
const catchAssyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");


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
  sendToken(user, 200, res);
  //   res.status(200).json({
  //     success: true,
  //     token: token,
  //   });
});

// Forgot Password = > /api/v1/password/forgot
exports.forgotPassword = catchAssyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("No user found", 404));
  }
  const resetToken = await user.generatePasswordToken();
  await user.save({ validateBeforeSave: false });

  //create reset password url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;
  const message = `Your password reset link is as follow:\n\n${resetUrl}\n\n If you have not requested this, 
  please ignore that`;
  4;

  try {
    await sendEmail({
      email: user.email,
      subject: "Jobee API Password Recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent successfully to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExipre = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler("Email is not sent.", 500));
  }
});

// Reset password /api/ve/password/reset/:token
exports.resetPassword = catchAssyncErrors(async (req, res, next) => {
  // HAsh URL Token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        "Password Reset Token is invalid or has been expired",
        400
      )
    );
  }

  //Steup new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExipre = undefined;
  await user.save();
  sendToken(user, 200, res);
});

// Logout user =>  /api/v1/logout
exports.logout = catchAssyncErrors(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logout Successfully",
  });
});
