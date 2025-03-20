const socketIo = require("socket.io");
const crypto = require("crypto");
const { chat } = require("./models/chat");

// ✅ Hash roomId for two users
const hashRoomId = (userId, targetUserId) => {
  const sortedIds = [userId, targetUserId].sort().join("_");
  return crypto.createHash("sha256").update(sortedIds).digest("hex");
};

const initializeSockets = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: ["http://localhost:5173", "https://tindev.duckdns.org"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // ✅ Join chat room
    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = hashRoomId(userId, targetUserId);
      console.log(`User ${userId} joined room: ${roomId}`);
      socket.join(roomId);
    });

    // ✅ Handle message sending from client
    socket.on(
      "sendMessage",
      async ({ text, userId, targetUserId, senderFirstname }) => {
        const roomId = hashRoomId(userId, targetUserId);

        // ✅ Check and fetch the existing chat
        let newchat = await chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!newchat) {
          // ✅ Create new chat if not found
          newchat = await chat.create({
            participants: [userId, targetUserId],
            messages: [],
          });
        }

        // ✅ Add the message to chat
        newchat.messages.push({ senderId: userId, text });
        await newchat.save();

        // ✅ Emit the message to both users in the room
        io.to(roomId).emit("receivedMessage", {
          senderFirstname,
          text,
          time: new Date(),
          senderId: userId,
        });
      }
    );

    // ✅ Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });


  return io;
};

module.exports = initializeSockets;
