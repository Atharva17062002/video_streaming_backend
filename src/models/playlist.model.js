import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const playlistSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        videos:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        }],
        owner:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        description:{
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

playlistSchema.plugin(mongooseAggregatePaginate);

export const Playlist =  mongoose.model("Playlist", playlistSchema);``