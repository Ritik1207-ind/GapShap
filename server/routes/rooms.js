const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Room = require('../models/Room');

// GET /api/rooms
// Get rooms (optionally filtered by membership)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = { isPrivate: false };
    
    if (req.query.joined === 'true') {
      // Return rooms where the user is a member OR rooms that are default/seeded (#general)
      query = {
        $or: [
          { members: req.user.id },
          { isDefault: true }
        ]
      };
    }

    const rooms = await Room.find(query)
      .populate('owner', 'username')
      .sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/rooms
// Create a new room
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    
    const newRoom = new Room({
      name,
      description,
      isPrivate: isPrivate || false,
      owner: req.user.id,
      members: [req.user.id] // Owner is automatically a member
    });

    const room = await newRoom.save();
    res.json(room);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/rooms/:id/join
// Join a room
router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const isMember = room.members.some(memberId => memberId.toString() === req.user.id);
    if (!isMember) {
      room.members.push(req.user.id);
      await room.save();
    }

    res.json(room);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/rooms/:id/leave
// Leave a room
router.post('/:id/leave', authMiddleware, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.members = room.members.filter(memberId => memberId.toString() !== req.user.id);
    await room.save();

    res.json(room);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
