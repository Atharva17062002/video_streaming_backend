import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Like from "../models/Like.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  try {
    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(400, "No such video found");
    }

    const likecriteria = { video: videoId, likedBy: req.user._id };

    const alreadyLiked = await Like.findOne(likecriteria);
    if (!alreadyLiked) {
      //create new like
      const newLike = await Like.create(likecriteria);
      if (!newLike) {
        throw new ApiError(500, "Unable to like the video");
      }
      return res
        .status(200)
        .json(new ApiResponse(200, newLike, "Successfully like the video"));
    }
    //already liked
    const dislike = await Like.deleteOne(likecriteria);
    if (!dislike) {
      throw new ApiError(500, "Unable to dislike the video");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Successfully dislike the video"));
  } catch (error) {
    throw new ApiError(400, "Error while toggling like");
  }
  //TODO: toggle like on video
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "Comment id is required");
  }

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new ApiError(400, "No such comment found");
    }

    const likecriteria = { comment: commentId, likedBy: req.user._id };

    const alreadyLiked = await Like.findOne(likecriteria);

    if (!alreadyLiked) {
      //create new like
      const newLike = await Like.create(likecriteria);
      if (!newLike) {
        throw new ApiError(500, "Unable to like the comment");
      }
      return res
        .status(200)
        .json(new ApiResponse(200, newLike, "Successfully like the comment"));
    }

    //already liked
    const dislike = await Like.deleteOne(likecriteria);
    if (!dislike) {
      throw new ApiError(500, "Unable to dislike the comment");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Successfully dislike the comment"));
  } catch (error) {
    throw new ApiError(400, "Error while toggling like");
  }
  //TODO: toggle like on comment
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "Tweet id is required");
  }

  try {
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      throw new ApiError(400, "No such tweet found");
    }

    const likecriteria = { tweet: tweetId, likedBy: req.user._id };

    const alreadyLiked = await Like.findOne(likecriteria);

    if (!alreadyLiked) {
      //create new like
      const newLike = await Like.create(likecriteria);
      if (!newLike) {
        throw new ApiError(500, "Unable to like the tweet");
      }
      return res
        .status(200)
        .json(new ApiResponse(200, newLike, "Successfully like the tweet"));
    }

    //already liked
    const dislike = await Like.deleteOne(likecriteria);
    if (!dislike) {
      throw new ApiError(500, "Unable to dislike the tweet");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Successfully dislike the tweet"));
    //TODO: toggle like on tweet
  } catch (error) {
    throw new ApiError(400, "Error while toggling like");
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  try {
    const like = await Like.aggregate([
      {
        $match: {
          video: mongoose.Types.ObjectId(videoId),
          likedBy: mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "video",
        },
      },
      {
        $unwind: "$video",
      },
      {
        $lookup: {
          from: "users",
          let: { owner_id: "$like.owner" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$owner_id"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                username: 1,
                fullName: 1,
                avatar: 1,
              },
            },
          ],
          as: "owner",
        },
      },
      {
        $unwind: "$owner",
      },
      {
        $project: {
          _id: "$like._id",
          title: "$like.title",
          thumbnail: "$like.thumbnail",
          owner: {
            username: "$owner.username",
            avatar: "$owner.avatar",
            fullName: "$owner.fullName",
          },
        },
      },
      {
        $group: {
          _id: null,
          likedVideos: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          likedVideos: 1,
        },
      },
    ]);

    if (!like || like.length < 0) {
      return res
        .status(200)
        .json(ApiResponse({}, 200, "No liked videos found"));
    }

    res.json(new ApiResponse(200, like, "Liked videos fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Error fetching liked videos");
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
