const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // In production, replace with frontend URL
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Models for migration
const Room = require('./models/Room');
const Message = require('./models/Message');
const User = require('./models/User');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chattra')
.then(async () => {
  console.log('MongoDB Connected');
  
  // Seed / Migration Logic
  try {
    let generalRoom = await Room.findOne({ isDefault: true });
    if (!generalRoom) {
      generalRoom = new Room({
        name: 'general',
        description: 'General discussion',
        isPrivate: false,
        isDefault: true
      });
      await generalRoom.save();
      console.log('Seeded default #general room');
    }

    // Backfill old messages
    const orphanedMessages = await Message.find({ roomId: null, dmId: null });
    if (orphanedMessages.length > 0) {
      await Message.updateMany(
        { roomId: null, dmId: null },
        { $set: { roomId: generalRoom._id } }
      );
      console.log(`Backfilled ${orphanedMessages.length} orphaned messages to #general`);
    }
  } catch (err) {
    console.error('Migration error:', err);
  }
})
.catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/dm', require('./routes/dm'));

// Socket setup
const socketHandlers = require('./socket/socketHandlers');
socketHandlers(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
