/*
  id string pk
  username string
  email string
  fullName string
  avatar string
  coverImage string
  watchHistory ObjectId[] videos
  password string
  refreshToken string
  createdAt Date
  updatedAt Date
*/

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,

      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

//Pre-Hooks
//Encrypt password - bcrypt : npm i bcrypt
//Dont use => bcz we need it's context
userSchema.pre("save", async function (next) {
  if (!this.modified("password")) return next();
  //if "password" is not modified return
  //when 1st time pass is set, then it is actually not modifying. It will return and not execute below codes

  this.password = bcrypt.hash(this.password, 10);

  next(); //pass it to next hook or wherever it needs to go
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); //boolean return
};

//generate ACCESS & REFRESH TOKEN
//using JWT: npm i jsonwebtoken
userSchema.methods.generateAccessToken = function () {
  //AccessToken: Short lived
  return jwt.sign(
    {
      //➡️ Payload of the token
      //➡️ Data that will be encoded inside the JWT
      _id: this._id,
      email: this.email,
      username: this.username,
      //'email' & 'username' is not used in production
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

//REFRESH-TOKEN
userSchema.methods.generateRefreshToken = function () {
  //AccessToken: Short lived
  return jwt.sign(
    {
      //➡️ Payload of the token
      //➡️ Data that will be encoded inside the JWT
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

userSchema.plugin(mongooseAggregatePaginate);
export const User = mongoose.model("User", userSchema);
