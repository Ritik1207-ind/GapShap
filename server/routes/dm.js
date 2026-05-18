const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const DirectMessage = require('../models/DirectMessage');
const User = require('../models/User');

// GET /api/dm
// Get all DM threads for the current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const dms = await DirectMessage.find({ participants: req.user.id })
      .populate('participants', 'username')
      .sort({ updatedAt: -1 });
    res.json(dms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/dm/:userId
// Start or get existing DM thread with a user
router.post('/:userId', authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'Cannot DM yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    let dm = await DirectMessage.findOne({
      participants: { $all: [currentUserId, targetUserId] }
    }).populate('participants', 'username');

    if (!dm) {
      const unreadCounts = new Map();
      unreadCounts.set(currentUserId, 0);
      unreadCounts.set(targetUserId, 0);

      dm = new DirectMessage({
        participants: [currentUserId, targetUserId],
        unreadCounts
      });
      await dm.save();
      dm = await DirectMessage.findById(dm._id).populate('participants', 'username');
    }

    res.json(dm);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PATCH /api/dm/:dmId/read
// Mark DM as read
router.patch('/:dmId/read', authMiddleware, async (req, res) => {
  try {
    const dm = await DirectMessage.findById(req.params.dmId);
    if (!dm) {
      return res.status(404).json({ message: 'DM not found' });
    }

    if (!dm.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not a participant' });
    }

    // Reset unread count for current user
    if (dm.unreadCounts) {
       dm.unreadCounts.set(req.user.id, 0);
    }
    
    await dm.save();
    await dm.populate('participants', 'username');
    res.json(dm);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
