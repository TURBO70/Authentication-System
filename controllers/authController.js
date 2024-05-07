const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
// const bcrypt = require("bcryptjs");

const User = require("../models/user.models");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken");
const customError = require("../utils/customError");
const { log } = require("console");
//Authentication-System
const signup = asyncHandler(async (req, res, next) => {
  // 1- create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  // 2- Creat token
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: JWT_EXPIRE_TIME,
  });
  res.status(201).json({ data: user, token });
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new customError("incorrect email or password", 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new customError("incorrect email or password", 401));
  }

  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: JWT_EXPIRE_TIME,
  });
  res.status(200).json({ data: user, token });
});

const allowTo = asyncHandler(async (...roles) => {
  if (!roles.includes(req.user.role)) {
    return next(
      new customError("you are not allowed to access this router", 403)
    );
  }
  next();
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  //1) Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new customError(`No user for this email : ${req.body.email}`, 404)
    );
  }
  //2) If user exists, Generate hash reset random 6 digits.
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  const hashResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // Save hashedRestCode in db
  user.passwordResetCode = hashResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  const message = `Hi ${user.name},
   \n We received a request to reset the passwrd on your  Account .
    \n ${resetCode} \n Enter this code to complete the reset.
    \n Thanks for helping us keep your account secure.
     \n `;

  // 3-Send reset code via email
  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset Code (Valid For 10 min)",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new customError("There is an error in sending email", 500));
  }
  res
    .status(200)
    .json({ status: "Success", message: "Reset Code send to email " });
});


const verifyPassResetCode = asyncHandler(async (req, res, next) => {
  // 1- Get user baed on reset code
  const hashResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode.toString())
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new customError("Reset Code invalid or expired", 422));
  }
  //2) resetcode valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: "success",
  });
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new customError(`No user for this email : ${req.body.email}`, 404)
    );
  }
  if (!user.passwordResetVerified) {
    return next(new customError("Reset code not verified", 400));
  }
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  //3) if every thing is okay, generate token
  const token = createToken(user._id);
  res.status(200).json({ token });
});

module.exports = { forgotPassword, signup, login, resetPassword,verifyPassResetCode };