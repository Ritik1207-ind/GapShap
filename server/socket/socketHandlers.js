const Message = require('../models/Message');
const DirectMessage = require('../models/DirectMessage');

// Track online users globally
// { socketId: { id: userId, username } }
const onlineUsers = new Map();

// Track user socket mappings to send direct messages easily
// { userId: [socketId1, socketId2] }
const userSockets = new Map();

// Track typing state in-memory since Redis is omitted
// typingTimeouts maps "roomId:userId" or "dmId:userId" to a timeout ID
const typingTimeouts = new Map();

// Current typers maps room/dm ID to a Set of active typers (usernames)
const currentTypers = new Map();

const broadcastTyping = (io, targetId) => {
  const typers = currentTypers.get(targetId);
  const typingList = typers ? Array.from(typers) : [];
  io.to(targetId).emit('user_typing', { targetId, typers: typingList });
};

const handleTypingStart = (io, targetId, userId, username) => {
  const key = `${targetId}:${userId}`;
  
  if (!currentTypers.has(targetId)) {
    currentTypers.set(targetId, new Set());
  }
  
  const typers = currentTypers.get(targetId);
  if (!typers.has(username)) {
    typers.add(username);
    broadcastTyping(io, targetId);
  }

  // Reset timeout
  if (typingTimeouts.has(key)) {
    clearTimeout(typingTimeouts.get(key));
  }

  const timeoutId = setTimeout(() => {
    handleTypingStop(io, targetId, userId, username);
  }, 3000); // 3 seconds timeout

  typingTimeouts.set(key, timeoutId);
};

const handleTypingStop = (io, targetId, userId, username) => {
  const key = `${targetId}:${userId}`;
  
  if (typingTimeouts.has(key)) {
    clearTimeout(typingTimeouts.get(key));
    typingTimeouts.delete(key);
  }

  const typers = currentTypers.get(targetId);
  if (typers && typers.has(username)) {
    typers.delete(username);
    broadcastTyping(io, targetId);
  }
};

const socketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Track active rooms for this socket to manage unread counts
    socket.activeRoomIds = new Set();

    socket.on('user_connected', (userData) => {
      onlineUsers.set(socket.id, userData);
      
      const { id } = userData;
      
      // Join personal room for DMs
      socket.join(`user:${id}`);
      
      // Track user sockets
      if (!userSockets.has(id)) {
        userSockets.set(id, new Set());
      }
      userSockets.get(id).add(socket.id);

      const uniqueUsers = Array.from(
        new Map(Array.from(onlineUsers.values()).map(u => [u.id, u])).values()
      );
      io.emit('user_online', uniqueUsers);
    });

    socket.on('join_room', ({ targetId }) => {
      if (!targetId) return;
      socket.join(targetId);
      socket.activeRoomIds.add(targetId);
      console.log(`Socket ${socket.id} joined room/dm ${targetId}`);
    });

    socket.on('leave_room', ({ targetId }) => {
      if (!targetId) return;
      socket.leave(targetId);
      socket.activeRoomIds.delete(targetId);
      console.log(`Socket ${socket.id} left room/dm ${targetId}`);
    });

    socket.on('typing_start', ({ targetId, userId, username }) => {
      if (!targetId || !userId || !username) return;
      handleTypingStart(io, targetId, userId, username);
    });

    socket.on('typing_stop', ({ targetId, userId, username }) => {
      if (!targetId || !userId || !username) return;
      handleTypingStop(io, targetId, userId, username);
    });

    socket.on('send_message', async (data) => {
      try {
        const { text, userId, username, roomId } = data;
        
        // Save to DB
        const newMessage = new Message({
          text,
          sender: userId,
          roomId
        });
        await newMessage.save();

        const messageToSend = {
          _id: newMessage._id,
          text: newMessage.text,
          roomId,
          sender: {
            _id: userId,
            username: username
          },
          timestamp: newMessage.timestamp
        };

        // Broadcast to room
        io.to(roomId).emit('receive_message', messageToSend);
      } catch (err) {
        console.error('Error saving/sending room message:', err);
      }
    });

    socket.on('send_dm', async (data) => {
      try {
        const { text, userId, username, dmId, toUserId } = data;

        // Save to DB
        const newMessage = new Message({
          text,
          sender: userId,
          dmId
        });
        await newMessage.save();

        // Increment unread count for target user if they are not actively viewing this DM
        const dm = await DirectMessage.findById(dmId);
        if (dm) {
          dm.lastMessage = text;
          
          let targetIsActive = false;
          const targetSockets = userSockets.get(toUserId);
          if (targetSockets) {
             for (const sockId of targetSockets) {
                const s = io.sockets.sockets.get(sockId);
                if (s && s.activeRoomIds && s.activeRoomIds.has(dmId)) {
                   targetIsActive = true;
                   break;
                }
             }
          }

          if (!targetIsActive && dm.unreadCounts) {
             const currentCount = dm.unreadCounts.get(toUserId) || 0;
             dm.unreadCounts.set(toUserId, currentCount + 1);
          }
          await dm.save();
        }

        const messageToSend = {
          _id: newMessage._id,
          text: newMessage.text,
          dmId,
          sender: {
            _id: userId,
            username: username
          },
          timestamp: newMessage.timestamp
        };

        // Send to both participants
        io.to(`user:${userId}`).emit('receive_message', messageToSend);
        io.to(`user:${toUserId}`).emit('receive_message', messageToSend);
      } catch (err) {
        console.error('Error saving/sending DM:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      const userData = onlineUsers.get(socket.id);
      
      if (userData) {
        const { id } = userData;
        const sockets = userSockets.get(id);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSockets.delete(id);
          }
        }
      }

      onlineUsers.delete(socket.id);
      const uniqueUsers = Array.from(
        new Map(Array.from(onlineUsers.values()).map(u => [u.id, u])).values()
      );
      io.emit('user_online', uniqueUsers);
    });
  });
};

module.exports = socketHandlers;
