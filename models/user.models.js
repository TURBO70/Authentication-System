const mongoose = require("mongoose");
// const { Schema } = require("mongoose");
const { type } = require("os");

const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name required"],
    trim: true,
    minLenght: [3, "too short user name "],
  },
  slug: {
    type: String,
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, "email required"],
    uniqe: true,
  },
  password: {
    type: String,
    required: [true, "password required"],
    minLenght: [3, "too short user name "],
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,

  phone: String,

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  active: {
    type: Boolean,
    default: true,
  },
});

userSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword =async function (canditatePassword) {
  const isMatch=await bcrypt.compare(this.password,canditatePassword)
      return isMatch;
  
  };

module.exports = mongoose.model("User", userSchema);
