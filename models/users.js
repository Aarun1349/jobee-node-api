const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email address"],
      unique: true,
      validate: [validator.isEmail, "Please enter valid email address"],
    },
    role: {
      type: String,
      enum: {
        values: ["user", "employer"],
        message: "Please select correct role",
      },
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: [8, "Your password must be at least 8 characters length"],
      select: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Encrpting password before saaving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  this.password = await bcrypt.hash(this.password, 10);
});

// Return JSON web token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

//Compare user password in database password
userSchema.methods.comparePassword = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password);
};

//Generate Password Reset Token
userSchema.methods.generatePasswordToken = async function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hasd and set to resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // set token expire time
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

// Virtual Methods

// Show all jobs created by user
userSchema.virtual("jobPublished", {
  ref: "Jobs",
  localField: "_id",
  foreignField: "user",
  justOne: false,
});
module.exports = mongoose.model("User", userSchema);
