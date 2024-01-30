import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js'; 
import {User} from '../models/user.model.js';
import uploadOnCloudinary  from '../utils/cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateRefreshandAccessToken = async(userid) => {
    try{
        const user = await User.findById(userid);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return {accessToken, refreshToken};
    }catch(error){
        throw new ApiError("Something went wrong while generating tokens", 500);
    
    }

}

const registerUser = asyncHandler(async (req, res) => {
    //get user details from req.body
    //validate user details - not empty
    //check if user exists
    //check for image and upload to cloudinary
    //create user object
    //save user to db
    //generate token
    //check for user creation
    //return response

    const {fullName , email, username,password} =  req.body 
    console.log(fullName , email, username,password);
     
    if ([fullName , email, username,password].some((field) => field?.trim() === "")) {
        throw new ApiError("Please fill all fields", 400);
    }

    const existeedUser = await User.findOne({$or: [{username}, {email}]})

    if(existeedUser){
        throw new ApiError("User already exists", 409);
    }

    const avatorLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    console.log(req.files?.avatar[0]?.path);

    let coverImageLocalPath ;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatorLocalPath){
        throw new ApiError("Please upload all images", 400);
    }
    const avatar = await uploadOnCloudinary(avatorLocalPath); 
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError("avatar file is required", 400);
    }

    const user = new User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        avatar:avatar.url,
        coverImage :coverImage?.url || "",
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError("User not created", 500);
    }
    
    return res.status(201).json(new ApiResponse(201, createdUser, "User created successfully"));
})

const loginUser = asyncHandler(async (req, res) => {
    //get user details from req.body
    //validate user details - not empty
    //check if user exists
    //check if password matches
    //generate token
    //check for user creation
    //return response

    const {username,email, password} = req.body;

    if (!username || !email){
        throw new ApiError("Please provide username or email", 400);
    }

    const user = await User.findOne({$or: [{username}, {email}]}).select("+password");

    if(!user){
        throw new ApiError("Invalid credentials", 404);
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if(!isPasswordCorrect){
        throw new ApiError("Invalid credentials", 401);
    }

    const {accessToken,refreshToken} = await generateRefreshandAccessToken(user._id);

    const loggerInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {user: loggerInUser, accessToken, refreshToken}, "User logged in successfully"));

});

const logoutUser = asyncHandler(async (req, res) => {
    //get user details from req.body
    //validate user details - not empty
    //check if user exists
    //check if password matches
    //generate token
    //check for user creation
    //return response

    User.findByIdAndUpdate(req.user._id, {$set: {refreshToken: undefined}}, {new: true, runValidators: true});
    const options = {
        httpOnly: true,
        secure: true
    } 

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));

});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =req.cookies.refreshToken || req.body.refreshToken;
    if(incomingRefreshToken){
        throw new ApiError("unauthorised request", 400);
    }

    const decodedToken =  jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id);

    if(!user){
        throw new ApiError("unauthorised request", 400);
    }

    if(user.refreshToken !== incomingRefreshToken){
        throw new ApiError("unauthorised request", 400);
    }

    const {accessToken, refreshToken} = await generateRefreshandAccessToken(user._id);


    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {user: loggerInUser, accessToken, refreshToken}, "User logged in successfully"));    



});

export {registerUser, loginUser, logoutUser, refreshAccessToken};