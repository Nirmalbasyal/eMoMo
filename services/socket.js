const { Server } = require("socket.io");
const Jwt = require("jsonwebtoken");
const User = require("../model/userModel");

// holds the io instance once initialized — starts as null, gets set by initSocket()
let io = null;

// call this once from app.js, after the http server is created
function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "https://emomo-frontend-omega.vercel.app/",
    },
  });

  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    const token = socket.handshake.auth.token;
    if (!token) return;

    Jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
      if (err) {
        console.log("Socket auth failed:", err.message);
        return;
      }

      const userInfo = await User.findById(decoded.id).select("-userPassword");
      if (!userInfo) return;

      socket.join(userInfo._id.toString());
      onlineUsers.set(userInfo._id.toString(), socket.id);
      console.log("User connected:", userInfo.userName);
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
    });
  });

  return io;
}

// call this from anywhere else (like orderController.js) to get the io instance
function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized yet — initSocket() must run before getIO() is called");
  }
  return io;
}

module.exports = { initSocket, getIO };
