import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Tweet from "../models/Tweet.js";
import User from "../models/User.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweek
  const { content } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "User id is required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(400, "No such user found");
  }

  const tweet = await Tweet.create({
    content,
    owner: userId,
  });

  if (!tweet) {
    throw new ApiError(500, "Unable to create tweet");
  }

  return res
    .status(200)
    .json(ApiResponse(200, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "User id is required");
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(400, "No such user found");
    }

    const tweets = await Tweet.find({ owner: userId });

    if (!tweets || tweets.length < 0) {
      return res
        .status(200)
        .json(ApiResponse({}, 200, "No tweets available for this user"));
    }
    res.json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
  } catch (err) {
    throw new ApiError(500, "Error fetching user tweets");
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "Tweet id is required");
  }

  try {
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      throw new ApiError(400, "No such tweet found");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content: req.body.content
            }
        },
        {new: true}
    );

    if (!updatedTweet) {
      throw new ApiError(500, "Unable to update tweet");
    }

    return res
      .status(200)
      .json(ApiResponse(200, updatedTweet, "Tweet updated successfully"));

  } catch (err) {
    throw new ApiError(500, "Error fetching tweet");
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(400, "Tweet id is required");
    }

    try {
        const tweet = await Tweet.findById(tweetId);

        if (!tweet) {
            throw new ApiError(400, "No such tweet found");
        }

        const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

        if (!deletedTweet) {
            throw new ApiError(500, "Unable to delete tweet");
        }

        return res
            .status(200)
            .json(ApiResponse(200, {}, "Tweet deleted successfully"));
    } catch (err) {
        throw new ApiError(500, "Error fetching tweet");
    }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
