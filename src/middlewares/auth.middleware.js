import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import {User}from "../models/user.model.js";
import e from "express";

const verifyJWT = asyncHandler(async (req, res, next) => {
  //get token from header
  //check if token exists
  //verify token
  //check if user exists
  //attach user to req.user
  //next
  try {
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError("Please provide a token", 401);
    }

    const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError("Invalid access token", 401);
    }

    req.user = user;
    next();
  } catch (err) {
    throw new ApiError(err|| "Invalid access token", 401);
  }
});

export default verifyJWT;
