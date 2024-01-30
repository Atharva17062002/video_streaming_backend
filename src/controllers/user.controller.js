import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js'; 
import {User} from '../models/user.model.js';
import uploadOnCloudinary  from '../utils/cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';

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

    const existeedUser = User.findOne({$or: [{username}, {email}]})

    if(existeedUser){
        throw new ApiError("User already exists", 409);
    }

    const avatorLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    console.log(req.files?.avatar[0]?.path);

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

export default registerUser;