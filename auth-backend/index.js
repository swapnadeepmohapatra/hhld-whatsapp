import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";
import usersRouter from "./routes/users.route.js";
import connectToMongoDB from "./db/connectToMongoDB.js";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();
const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    allowedHeaders: ["*"],
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("chat msg", (msg) => {
    console.log("Received msg " + msg);

    io.emit("chat msg", msg);
  });
});

app.use(express.json());

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.use(cookieParser());

app.use("/users", usersRouter);
app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Welcome to HHLD Chat App!");
});

server.listen(PORT, (req, res) => {
  connectToMongoDB();
  console.log(`Server is running at ${PORT}`);
});
