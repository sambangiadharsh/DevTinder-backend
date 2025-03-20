const socketIo = require("socket.io");
const crypto = require("crypto");
const { chat } = require("./models/chat");

// Hash roomId for two users
const hashRoomId = (userId, targetUserId) => {
  const sortedIds = [userId, targetUserId].sort().join("_");
  return crypto.createHash("sha256").update(sortedIds).digest("hex");
};

// Use a different path for production if desired
const SOCKET_PATH = process.env.NODE_ENV === "production" ? "/api/socket.io/" : "/socket.io/";

const initializeSockets = (server) => {
  const io = socketIo(server, {
    path: SOCKET_PATH,
    cors: {
      origin: ["http://localhost:5173", "https://tindev.duckdns.org"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join chat room
    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = hashRoomId(userId, targetUserId);
      console.log(`User ${userId} joined room: ${roomId}`);
      socket.join(roomId);
    });

    // Handle message sending
    socket.on("sendMessage", async ({ text, userId, targetUserId, senderFirstname }) => {
      try {
        const roomId = hashRoomId(userId, targetUserId);
        let newchat = await chat.findOne({ participants: { $all: [userId, targetUserId] } });
        if (!newchat) {
          newchat = await chat.create({
            participants: [userId, targetUserId],
            messages: [],
          });
        }
        newchat.messages.push({ senderId: userId, text });
        await newchat.save();

        io.to(roomId).emit("receivedMessage", {
          senderFirstname,
          text,
          time: new Date(),
          senderId: userId,
        });
      } catch (error) {
        console.error("Error in sendMessage:", error);
        socket.emit("errorMessage", { error: "Failed to send message." });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initializeSockets;
