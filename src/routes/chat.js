const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Chat = require("../models/chat");

const chatRouter = express.Router();

// Get API to get Chats from DB

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const targetUserId = req.params.targetUserId;

  const userId = req.user._id;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }

    res.json(chat);
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});

module.exports = chatRouter;
