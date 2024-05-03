import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import { addMsgToConversation } from "./controllers/msgs.controller.js";
import msgsRouter from "./routes/msgs.route.js";
import connectToMongoDB from "./db/connectToMongoDB.js";
import { subscribe, publish } from "./redis/msgsPubSub.js";

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

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("Client connected");

  const username = socket.handshake.query.username;
  console.log("Username:", username);

  userSocketMap[username] = socket;

  const channelName = `chat_${username}`;
  subscribe(channelName, (msg) => {
    socket.emit("chat msg", JSON.parse(msg));
  });

  socket.on("chat msg", (msg) => {
    console.log(msg.sender);
    console.log(msg.receiver);
    console.log(msg.text);

    const receiverSocket = userSocketMap[msg.receiver];

    if (receiverSocket) {
      receiverSocket.emit("chat msg", msg);
    } else {
      const channelName = `chat_${msg.receiver}`;
      publish(channelName, JSON.stringify(msg));
    }

    addMsgToConversation([msg.sender, msg.receiver], {
      text: msg.text,
      sender: msg.sender,
      receiver: msg.receiver,
    });
  });
});

app.use("/msgs", msgsRouter);

app.get("/", (req, res) => {
  res.send("Welcome to HHLD Chat App!");
});

server.listen(PORT, (req, res) => {
  connectToMongoDB();
  console.log(`Server is running at ${PORT}`);
});
