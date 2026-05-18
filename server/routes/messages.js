const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Message = require('../models/Message');

// GET /api/messages?roomId=...
// Get last 50 messages for a room
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.query;
    if (!roomId) {
      return res.status(400).json({ message: 'roomId is required' });
    }

    const messages = await Message.find({ roomId, dmId: null })
      .populate('sender', 'username')
      .sort({ timestamp: -1 })
      .limit(50);
    
    // Reverse to send oldest first for the chat UI
    res.json(messages.reverse());
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /api/messages/dm/:dmId
// Get last 50 messages for a DM thread
router.get('/dm/:dmId', authMiddleware, async (req, res) => {
  try {
    const { dmId } = req.params;

    const messages = await Message.find({ dmId, roomId: null })
      .populate('sender', 'username')
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.json(messages.reverse());
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
