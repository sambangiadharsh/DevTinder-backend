const socketIo = require('socket.io');
const crypto = require('crypto');
const { chat } = require('./models/chat');

// ✅ Hash roomId for two users
const hashRoomId = (userId, targetUserId) => {
  const sortedIds = [userId, targetUserId].sort().join('_');
  return crypto.createHash('sha256').update(sortedIds).digest('hex');
};

const initializeSockets = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // ✅ Join chat room
    socket.on('joinChat', ({ userId, targetUserId }) => {
      const roomId = hashRoomId(userId, targetUserId);
      console.log(`User ${userId} joined room: ${roomId}`);
      socket.join(roomId);
    });

    // ✅ Handle message sending
    socket.on('sendMessage', async ({ text, userId, targetUserId, firstname }) => {
      try {

        //first backend check connection is between there or not(TBE)
        const roomId = hashRoomId(userId, targetUserId);
        let existingChat = await chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        // Create new chat if doesn't exist
        if (!existingChat) {
          existingChat = new chat({
            participants: [userId, targetUserId],
            messages: [],
          });
        }

        // Save new message
        existingChat.messages.push({
          senderId: userId,
          text,
        });
        await existingChat.save();

        // Emit to both users in the room
        socket.to(roomId).emit('receivedMessage', {
          firstname,
          text,
          time: new Date().toISOString(),
          userId,
        });
      } catch (err) {
        console.error('Error sending message:', err);
      }
    });

    // ✅ Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initializeSockets;
