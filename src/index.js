import dotenv from "dotenv";
import connectDB from "./db/index.db.js";

dotenv.config(
    {
        path:"./.env"
    }
);


connectDB()







/*
import express from "express";
const app = express();

;(async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log(error);
            throw error
        
        })
        app.listem(process.env.PORT,()=>{
            console.log(`Server is running on port ${process.env.PORT}`);
        })
    }catch(err){
        console.log(err)
    }
})()
*/