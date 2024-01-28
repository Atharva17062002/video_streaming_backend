import mongoose from "mongoose";
import jwt  from "jsonwebtoken";
import bcrypt from "bcrypt";



const userSchema = new mongoose.Schema({
    // id:{
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    refreshToken:{
        type: String,
        // required: false,
    },
    fullName:{
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar:{
        type: String, //cloudinary url
        required: true,
         
    },
    coverImage:{
        type: String,
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ]
},{timestamps: true});

userSchema.pre("save", async function(next){
    const user = this;
    if(user.isModified("password")){
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

userSchema.methods.isPasswordCorrect = async function(password){
    const user = this;
    return await bcrypt.compare(password, user.password);
}

userSchema.methods.generateAccessToken = function(){
    const user = this;
    return jwt.sign({_id: user._id,email: user.email, username: user.username,fullName: user.fullName}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRY});
}

userSchema.methods.generateRefreshToken = function(){
    const user = this;
    return jwt.sign({_id: user._id}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: process.env.REFRESH_TOKEN_EXPIRY});
}

export const User =  mongoose.model("User", userSchema);