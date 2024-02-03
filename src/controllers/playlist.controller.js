import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Playlist from "../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!name || !description){
        throw new ApiError(400, "Name and description are required")
    }

    try{
        const playlist = new Playlist.create({
            name,
            description,
            owner: req.user._id,
            videos: []
        })

        if(!playlist){
            throw new ApiError(500, "Error creating playlist")
        }

        return res.status(200).json(new ApiResponse(201, "Playlist created", newPlaylist))
    } catch (error) {
        throw new ApiError(500, "Error creating playlist")
    }

    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if(!userId){
        throw new ApiError(400, "User id is required")
    }

    try{
        const playlists = await Playlist.find({owner: userId})

        if(!playlists){
            throw new ApiError(404, "No playlists found")
        }

        return res.status(200).json(new ApiResponse(200, "Playlists found", playlists))
    }
    catch (error) {
        throw new ApiError(500, "Error fetching playlists")
    }
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!playlistId){
        throw new ApiError(400, "Playlist id is required")
    }

    try{
        const playlist = await Playlist.findById(playlistId)

        if(!playlist){
            throw new ApiError(404, "No playlist found")
        }

        return res.status(200).json(new ApiResponse(200, "Playlist found", playlist))   
    } catch (error) {
        throw new ApiError(500, "Error fetching playlist")
    }
    //TODO: get playlist by id
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !videoId){
        throw new ApiError(400, "Playlist id and video id are required")
    }

    try{
        const playlist = await Playlist.findById(playlistId)

        if(!playlist){
            throw new ApiError(404, "No playlist found")
        }

        const video = await Video.findById(videoId)

        if(!video){
            throw new ApiError(404, "No video found")
        }

        const addVideo = await Playlist.findByIdAndUpdate(playlistId, {$push: {videos: videoId}})
        if(!addVideo){
            throw new ApiError(500, "Error adding video to playlist")
        }

        return res.status(200).json(new ApiResponse(200, "Video added to playlist", addVideo))
    } catch (error) {
        throw new ApiError(500, "Error adding video to playlist")
    }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!playlistId || !videoId){
        throw new ApiError(400, "Playlist id and video id are required")
    }

    try{
        const playlist = await Playlist.findById(playlistId)

        if(!playlist){
            throw new ApiError(404, "No playlist found")
        }

        const video = await Video.findById(videoId)

        if(!video){
            throw new ApiError(404, "No video found")
        }

        const removeVideo = await Playlist.findByIdAndUpdate(playlistId, {$pull: {videos: videoId}})
        if(!removeVideo){
            throw new ApiError(500, "Error removing video from playlist")
        }

        return res.status(200).json(new ApiResponse(200, "Video removed from playlist", removeVideo))
    } catch (error) {
        throw new ApiError(500, "Error removing video from playlist")
    }
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if(!playlistId){
        throw new ApiError(400, "Playlist id is required")
    }

    try{
        const playlist = await Playlist.findById(playlistId)

        if(!playlist){
            throw new ApiError(404, "No playlist found")
        }

        const deletePlaylist = await Playlist.findByIdAndDelete(playlistId)
        if(!deletePlaylist){
            throw new ApiError(500, "Error deleting playlist")
        }

        return res.status(200).json(new ApiResponse(200, "Playlist deleted", deletePlaylist))
    
    } catch (error) {
        throw new ApiError(500, "Error deleting playlist")
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!playlistId){
        throw new ApiError(400, "Playlist id is required")
    }

    try{
        const playlist = await Playlist.findById(playlistId)

        if(!playlist){
            throw new ApiError(404, "No playlist found")
        }

        const updatePlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $set: {
                  name: name,
                  description: description,
                },
              },
              {
                new: true,
              }
        )
        if(!updatePlaylist){
            throw new ApiError(500, "Error updating playlist")
        }

        return res.status(200).json(new ApiResponse(200, "Playlist updated", updatePlaylist))
    
    } catch (error) {
        throw new ApiError(500, "Error updating playlist")
    }
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}