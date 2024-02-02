import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Video from "../models/Video.js";
import Subscription from "../models/Subscription.js";
import Like from "../models/Like.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "User id is required");
  }

  try {
    const channelStat = await Video.aggregate([
      {
        $match: { owner: mongoose.Types.ObjectId(userId) },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "Likes",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "owner",
          foreignField: "channel",
          as: "Subscribers",
        },
      },
      {
        $group: {
          _id: null,
          TotalVideos: { $sum: 1 },
          TotalViews: { $sum: "$views" },
          TotalSubscribers: { $first: { $size: "$Subscribers" } },
          TotalLikes: { $first: { $size: "$Likes" } },
        },
      },
      {
        $project: {
          _id: 0,
          TotalSubscribers: 1,
          TotalLikes: 1,
          TotalVideos: 1,
          TotalViews: 1,
        },
      },
    ]);

    if (!channelStat || channelStat.length < 0) {
      return res
        .status(200)
        .json(ApiResponse({}, 200, "No stats available for this channel"));
    }

    res.json(
      new ApiResponse(200, channelStat, "Channel stats fetched successfully")
    );
  } catch (err) {
    throw new ApiError(500, "Error fetching channel stats");
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "User id is required");
  }

  try {
    const videoCount = await Video.find({ owner: userId });

    if (!videoCount || videoCount.length < 0) {
      return res
        .status(200)
        .json(ApiResponse({}, 200, "No videos available for this channel"));
    }

    res.json(
      new ApiResponse(200, videoCount, "Channel videos fetched successfully")
    );
  } catch (err) {
    throw new ApiError(500, "Error fetching channel videos");
  }
});

export { getChannelStats, getChannelVideos };
