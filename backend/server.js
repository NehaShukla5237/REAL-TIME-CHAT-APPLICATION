const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

let onlineUsers = {};

io.on("connection", (socket) => {
  console.log("New User Connected:", socket.id);

  socket.on("join_room", ({ username, room }) => {
    socket.join(room);
    onlineUsers[socket.id] = username;
    socket.to(room).emit("user_joined", `${username} joined the chat`);
    io.to(room).emit("online_users", Object.values(onlineUsers));
  });

  socket.on("send_message", (data) => {
    io.to(data.room).emit("receive_message", data);
  });

  socket.on("typing", ({ room, username }) => {
    socket.to(room).emit("typing", username);
  });

  socket.on("disconnect", () => {
    const user = onlineUsers[socket.id];
    delete onlineUsers[socket.id];
    io.emit("user_left", user);
    console.log("User Disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("✅ Server listening on port 5000");
});



