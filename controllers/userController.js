const User = require("../models/users");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandle");
const sendToken = require("../utils/jwtToken");
const Job = require("../models/jobs");
const fs = require("fs");
const apiFilters = require("../utils/apiFilters");
const ApiFilters = require("../utils/apiFilters");

// Get User Profile => /api/v1/me

exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: "jobPublished",
    select: "title postingDate",
  });
  res.status(200).json({
    success: true,
    data: user,
  });
});

// Update current user password => /api/v1/user/password

exports.updateUserPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  // Check Previous password
  const isMatched = await user.comparePassword(req.body.currentPassword);
  if (!isMatched) {
    return next(new ErrorHandler("Password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res);
  res.status(200).json({
    success: true,
    message: "Password Updated Successfully",
  });
});

//Update current user data => api/v1/me/update

exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    message: "User details Updated Successfully",
  });
});

// delete existing user => /api/v1/me/remove

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  await deleteUserData(req.user.id, req.user.role);
  const user = await User.findByIdAndDelete(req.user.id);
  res.cookie("token", "none", {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  if (!user) {
    return next(new ErrorHandler("User does not exist", 404));
  }
  res.status(200).json({
    success: true,
    message: "User deleted Successfully",
  });
});

//Show all applied jobs => /api/v1/jobs/applied

exports.getAppliedJobs = catchAsyncErrors(async (req, res, next) => {
  const appliedJobs = await Job.find({ "applicants.id": req.user.id }).select(
    "+applicantApplied"
  );
  res.status(200).json({
    success: true,
    results: appliedJobs.length,
    data: appliedJobs,
  });
});

//show all jobs publised by employeer =>/ap/v1/jobs/published
exports.getAllPublished = catchAsyncErrors(async (req, res, next) => {
  const publishedJobs = await Job.find({ user: req.user.id });
  res.status(200).json({
    success: true,
    results: publishedJobs.length,
    data: publishedJobs,
  });
});

// Show all users =>/api/v1/users
exports.getUsers = catchAsyncErrors(async (req, res, next) => {
  const apiFilters = new ApiFilters(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagintion();
  const users = await apiFilters.query;
  res.status(200).json({
    success: true,
    results: users.length,
    data: users,
  });
});

// Delete user(admin)  => api/v1/user/:id

exports.deleteUserAdmin = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("User Not Found ", 404));
  }
  deleteUserData(user.id, user.role);
  user.remove();
  res.status(200).json({
    success: true,
    message: "User deleted Successfully",
  });
});

async function deleteUserData(user, role) {
  if (role === "employer") {
    await Job.deleteMany({ user: user });
  }
  if (role === "user") {
    const appliedJobs = await Job.find({ "applicants.id": user }).select(
      "+applicantApplied"
    );
    for (let i = 0; i < appliedJobs.length; i++) {
      let obj = appliedJobs[i].applicantsApplied.find((o) => o.id === user);
      console.log(__dirname);
      let filePath = `${__dirname}/public/uploads/${obj.resume}`.replace(
        "\\controllers",
        ""
      );
      fs.unlink(filePath, (err) => {
        if (err) {
          return console.log(err);
        }
      });

      appliedJobs[i].applicantsApplied.splice(
        appliedJobs[i].applicantsApplied.indexOf(obj.id)
      );
      await appliedJobs[i].save();
    }
  }
}
