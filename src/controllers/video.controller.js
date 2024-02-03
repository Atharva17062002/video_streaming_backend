import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import uploadCloudinary from "../utils/cloudinary.js";

const isUserOwner = async (videoId, req) => {
  const video = await Video.findById(videoId);

  if (video?.owner !== req.user?._id) {
    if (video?.owner.toString() !== req.user?._id.toString()) {
      return false;
    }

    return true;
  }
};

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if (!req.file) {
    throw new ApiError(400, "Video is required");
  }

  const video = req.files?.videoFile[0].path;
  const thumbnaillocalpath = req.files?.thumbnail[0]?.path;

  if (!video) {
    throw new ApiError(400, "Video is required");
  }

  if (!thumbnaillocalpath) {
    throw new ApiError(400, "Thumbnail is required");
  }
  const uploadedVideo = await uploadCloudinary(video, "videos");
  const uploadedThumbnail = await uploadCloudinary(
    thumbnaillocalpath,
    "thumbnails"
  );

  if (!uploadedThumbnail.url) {
    throw new ApiError(500, "Unable to upload video");
  }

  if (!uploadedVideo.url) {
    throw new ApiError(500, "Unable to upload video");
  }

  const newVideo = await Video.create({
    videoFile: uploadedVideo?.url,
    thumbnail: uploadedThumbnail?.url,
    title,
    description,
    duration: uploadedVideo?.duration,
    isPublished: true,
    owner: req.user?._id,
  });

  if (!newVideo) {
    throw new ApiError(500, "Unable to upload video");
  }

  res
    .status(200)
    .json(new ApiResponse(200, newVideo, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  try {
    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(400, "No such video found");
    }

    res.json(new ApiResponse(200, video, "Video fetched successfully"));
  } catch (err) {
    throw new ApiError(500, "Error fetching video");
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "No such video found");
  }

  const isUserAuthorized = await isUserOwner(videoId, req);

  if (!isUserAuthorized) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  const { title, description } = req.body;

  if (!title && !description) {
    throw new ApiError(400, "Title or description is required");
  }

  const thumbnaillocalpath = req.file?.path;

  const thumbnail = await uploadCloudinary(thumbnaillocalpath, "thumbnails");

  if (!thumbnail) {
    if (!thumbnail.url) {
      throw new ApiError(500, "Unable to upload thumbnail");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          title: title,
          description: description,
          thumbnail: thumbnail?.url,
        },
      },
      {
        new: true,
      }
    );

    if (!updatedVideo) {
      throw new ApiError(500, "Unable to update video");
    }

    res
      .status(200)
      .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  try {
    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(400, "No such video found");
    }

    const isUserAuthorized = await isUserOwner(videoId, req);

    if (!isUserAuthorized) {
      throw new ApiError(403, "You are not authorized to delete this video");
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
      throw new ApiError(500, "Unable to delete video");
    }

    res
      .status(200)
      .json(new ApiResponse(200, {}, "Video deleted successfully"));
  } catch (err) {
    throw new ApiError(500, "Error fetching video");
  }
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  try {
    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(400, "No such video found");
    }

    const isUserAuthorized = await isUserOwner(videoId, req);

    if (!isUserAuthorized) {
      throw new ApiError(403, "You are not authorized to update this video");
    }

    const updatedVideo = await Video.findByIdAndUpdate([
      videoId,
      {
        $set: {
          isPublished: !video.isPublished,
        },
      },
      {
        new: true,
      },
    ]);

    if (!updatedVideo) {
      throw new ApiError(500, "Unable to update video");
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedVideo,
          "Video publish status updated successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, "Error fetching video");
  }
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
