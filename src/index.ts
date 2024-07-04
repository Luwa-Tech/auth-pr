import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import "reflect-metadata";
import cookieParser from "cookie-parser";
import ServerDataSource from "./config/databaseConn";
import userRouter from "./routes/user";

dotenv.config();

const server = express();
const port = 3000;

server.use(cors());
server.use(cookieParser());
server.use(express.static("public"));
server.use(express.json());

server.use("/api/v1/users", userRouter);

ServerDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
        server.listen(port, () => {
            console.log(`Server running on ${port} successfully`);
        })
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
    })
