const express=require('express');
const {userAuth}=require("../middlewares/auth");
const chatRouter = express.Router();
const {chat}=require("../models/chat");

chatRouter.get('/chat/:targetUserId', userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const targetUserId = req.params.targetUserId;

    let oldChat = await chat
      .findOne({
        participants: { $all: [userId, targetUserId] },
      })
      .populate({
        path: 'messages.senderId',
        select: 'firstName lastName',
      })
      .populate({
        path: 'participants',
        select: 'firstName lastName',
      });

    if (!oldChat) {
      oldChat = new chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await oldChat.save();
    }

    res.json(oldChat);
  } catch (err) {
    res.status(400).json('Error fetching chat messages');
  }
});

module.exports = chatRouter;
