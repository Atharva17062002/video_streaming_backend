import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    if (!channelId) {
        throw new ApiError(400, "Channel id is required");
    }

    const user = req.user?._id;
    const credentials = {channel: channelId, subscriber: user}

    try{
        const subscribed = await Subscription.findOne(credentials);

        if(subscribed){
            // unsubscribe
            const unsubscribed = await Subscription.deleteOne(credentials);
            if(!unsubscribed){
                throw new ApiError(500, "Unable to unsubscribe");
            }
            return res
            .status(200)
            .json(new ApiResponse(200, {}, "Successfully unsubscribed"));
        }

        // subscribe
        const newSubscription = await Subscription.create(credentials);

        if(!newSubscription){
            throw new ApiError(500, "Unable to subscribe");
        }

        return res
        .status(200)
        .json(new ApiResponse(200, newSubscription, "Successfully subscribed"));
    }catch{
        throw new ApiError(400, "Error while toggling subscription");
    }

    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!channelId) {
        throw new ApiError(400, "Channel id is required");
    }

    try{
        const channel = await User.findById(channelId);

        if(!channel){
            throw new ApiError(400, "No such channel found");
        }

        const subscribers = await Subscription.aggregate([
            {
                $match: {channel: mongoose.Types.ObjectId(channelId)}
            },
            {
                $group: {
                    _id: "channel",
                    subscribers: { $push: "$subscriber"}
                }
            },{
                $project:{
                    _id:0,
                    subscribers:1
                }
            }
        ]);
    }catch{
        throw new ApiError(500, "Error fetching subscribers");
    }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!subscriberId) {
        throw new ApiError(400, "Subscriber id is required");
    }

    try{
        const subscriber = await User.findById(subscriberId);

        if(!subscriber){
            throw new ApiError(400, "No such subscriber found");
        }

        const channels = await Subscription.aggregate([
            {
                $match: {subscriber: mongoose.Types.ObjectId(subscriberId)}
            },
            {
                $group: {
                    _id: "subscriber",
                    channels: { $push: "$channel"}
                }
            },{
                $project:{
                    _id:0,
                    channels:1
                }
            }
        ]);
    }catch{
        throw new ApiError(500, "Error fetching channels");
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}