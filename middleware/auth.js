const jwt = require("jsonwebtoken");
const User = require("../models/users");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandle");
const { off } = require("../models/users");

// Check if the user is authenticted or not
exports.authenticateUser = catchAsyncErrors(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
//   console.log("TOKEN", req.headers);
  if (!token) {
    return next(new ErrorHandler("Login First to access this resource", 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  next();
});

exports.authorizeRoles =(...roles)=>{
   
    return (req,res,next)=>{
        
        if(!roles.includes(req.user.role)){
            console.log("TOKEN", roles)
            return next(new ErrorHandler(`Role(${req.user.role}) is not allowed to access this resorce`,403))
        }
        next();
    }
}
