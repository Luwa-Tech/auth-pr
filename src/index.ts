import express from "express";

const server = express();
const port = 3000;

server.use("/hello", (req, res) => {
    res.send("Hello, world");
})

server.listen(port, () => {
    console.log(`Server running on port ${port} successfully`);
})