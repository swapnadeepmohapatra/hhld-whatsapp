import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { addMsgToConversation } from "./controllers/msgs.controller.js";

dotenv.config();
const PORT = process.env.PORT || 8081;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    allowedHeaders: ["*"],
    origin: "*",
  },
});

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("Client connected");

  const username = socket.handshake.query.username;
  console.log("Username:", username);

  userSocketMap[username] = socket;

  socket.on("chat msg", (msg) => {
    console.log(msg.sender);
    console.log(msg.receiver);
    console.log(msg.text);

    const receiverSocket = userSocketMap[msg.receiver];
    if (receiverSocket) {
      receiverSocket.emit("chat msg", msg);
    }
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to HHLD Chat App!");
});

server.listen(PORT, (req, res) => {
  console.log(`Server is running at ${PORT}`);
});
