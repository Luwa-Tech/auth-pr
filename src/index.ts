import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectToDB from "./config/databaseConn";
import mongoose from "mongoose";
dotenv.config();

const server = express();
const port = 3000;

connectToDB()

server.use(cors());
server.use(express.static("public"));
server.use(express.json());


mongoose.connection.once("open", () => {
    server.listen(port, () => {
        console.log(`Server running on ${port} successfully`);
    })
})