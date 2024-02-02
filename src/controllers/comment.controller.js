import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Comment from "../models/comment.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if(!videoId){
    throw new ApiError(400, "Video id is required");
  }



  const comments = await Comment.aggregate([
    {
      $match: { videoId: mongoose.Types.ObjectId(videoId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "user",
        pipeline:[{
          $project:{
            username: 1,
            fullName: 1,
            avatar: 1
          }
        }]
      },
    },
    
  
  ]);

  if(!comments|| comments.length <0){
    return res
    .status(200)
    .json(ApiResponse({},200,"No comments on video"))
  }
  
  

  res.json(new ApiResponse(200,comments,"Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { commentContent } = req.query;

  if(!videoId){
    throw new ApiError("Give video Id",400)
  }

  try{
    const video = Video.findById(videoId)
    if(!video ){
      throw new ApiError("No such video",400)
    }

    if(!commentContent){
      throw new ApiError("Comment content is needed",400)
    }

    const comment = await Comment.create({
      content: commentContent,
      video: videoId,
      owner: req.user?._id
    })

    if(!comment){
      throw new ApiError("Unable to create a comment", 500)
    }

    return res
    .status(200)
    .ApiResponse(200,comment,"Comment created successfully")
  }
  catch(err){
    throw new ApiError(err?.message || "Unable to create comment",500)
  }
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId} = req.params;
  const { commentContent } = req.query;

  if(!commentId){
    throw new ApiError("Give comment Id",400)
  }

  try{
    const comment = Comment.findById(commentId)
    if(!comment){
      throw new ApiResponse("Comment not found",400)
    }

    const UpdatedComment = await Comment.findByIdAndUpdate(
      commentId,{
        $set:{
          content: commentContent
        }

      },{
        new: true
      }
    )

    if(!UpdatedComment){
      throw new ApiError("Unable to update comment",500)
    }

    return res
    .status(200)
    .json(ApiResponse(200,UpdatedComment,"Comment updated successfully"))
  }catch(e){
    throw new ApiError(e?.message || "Unable to update comment",500)
  }

  
});

const deleteComment = asyncHandler(async (req, res) => {

  const { commentId} = req.params;

  if(!commentId){
    throw new ApiError("Give comment Id",400)
  }

  try{
    const comment = Comment.findById(commentId)
    if(!comment){
      throw new ApiResponse("Comment not found",400)
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if(!deletedComment){
      throw new ApiError("Unable to delete comment",500)
    }

    return res
    .status(200)
    .json(ApiResponse(200,deletedComment,"Comment deleted successfully"))
  }
  catch(e){
    throw new ApiError(e?.message || "Unable to delete comment",500)
  }

});

export { getVideoComments, addComment, updateComment, deleteComment };
