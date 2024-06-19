import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectToDB from "./config/databaseConn";
import mongoose from "mongoose";
import userRouter from "./routes/user";

dotenv.config();

const server = express();
const port = 3000;

connectToDB()

server.use(cors());
server.use(cookieParser());
server.use(express.static("public"));
server.use(express.json());

server.use("/api/v1/users", userRouter);

mongoose.connection.once("open", () => {
    server.listen(port, () => {
        console.log(`Server running on ${port} successfully`);
    })
})