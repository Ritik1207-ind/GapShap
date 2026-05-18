import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './hooks/useAuth';
import { useSocket } from './hooks/useSocket';
import { useRooms } from './hooks/useRooms';
import { useDMs } from './hooks/useDMs';
import { useTyping } from './hooks/useTyping';

import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import RoomView from './components/RoomView';
import DMView from './components/DMView';
import UserList from './components/UserList';
import RoomBrowser from './components/RoomBrowser';
import UserBrowser from './components/UserBrowser';
import CreateRoomModal from './components/CreateRoomModal';

const API_URL = 'http://localhost:5000/api';

function App() {
  const { user, token, loading, error, register, login, logout, setError } = useAuth();
  
  const [activeView, setActiveView] = useState({ type: null, id: null });
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  const [showRoomBrowser, setShowRoomBrowser] = useState(false);
  const [showUserBrowser, setShowUserBrowser] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  const { rooms, createRoom, joinRoom } = useRooms(token);
  const { dms, startDM, markRead, updateDMData } = useDMs(token);

  const activeTargetId = activeView.id;

  // Reset all local state on logout
  useEffect(() => {
     if (!user) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveView({ type: null, id: null });
        setMessages([]);
        setOnlineUsers([]);
     }
  }, [user]);

  // Set default view on load
  useEffect(() => {
    if (user && rooms.length > 0 && !activeView.id) {
       const general = rooms.find(r => r.name === 'general') || rooms[0];
       // eslint-disable-next-line react-hooks/set-state-in-effect
       setActiveView({ type: 'room', id: general._id });
    }
  }, [user, rooms, activeView.id]);

  // Load message history when view changes
  useEffect(() => {
    if (!token || !activeTargetId) return;
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistoryLoading(true);
    const endpoint = activeView.type === 'room' 
      ? `${API_URL}/messages?roomId=${activeTargetId}`
      : `${API_URL}/messages/dm/${activeTargetId}`;
      
    axios.get(endpoint)
      .then((res) => {
         setMessages(res.data);
         if (activeView.type === 'dm') {
            markRead(activeTargetId);
         }
      })
      .catch((err) => console.error('Failed to load history:', err))
      .finally(() => setHistoryLoading(false));
  }, [activeTargetId, token, activeView.type, markRead]);

  const handleReceiveMessage = useCallback((message) => {
    // Only append if it belongs to current view
    if ((activeView.type === 'room' && message.roomId === activeTargetId) ||
        (activeView.type === 'dm' && message.dmId === activeTargetId)) {
       setMessages((prev) => [...prev, message]);
       if (activeView.type === 'dm') {
          markRead(activeTargetId);
       }
    } else if (message.dmId) {
       // Update unread count locally for DMs not currently active
       updateDMData(message.dmId, (dm) => {
          const newCounts = { ...dm.unreadCounts };
          newCounts[user.id] = (newCounts[user.id] || 0) + 1;
          return { ...dm, lastMessage: message.text, unreadCounts: newCounts };
       });
    }
  }, [activeTargetId, activeView.type, markRead, updateDMData, user]);

  const handleUsersUpdate = useCallback((users) => {
    const uniqueUsers = Array.from(new Map(users.map(u => [u.id, u])).values());
    setOnlineUsers(uniqueUsers);
  }, []);

  const { socket, joinRoom: socketJoinRoom, leaveRoom: socketLeaveRoom, sendMessage, sendDM } = useSocket({
    user,
    onReceiveMessage: handleReceiveMessage,
    onUsersUpdate: handleUsersUpdate,
  });

  const { handleInput, typingData, onTypingUpdate } = useTyping(
     { emitTypingStart: (id) => socket?.emit('typing_start', { targetId: id, userId: user.id, username: user.username }),
       emitTypingStop: (id) => socket?.emit('typing_stop', { targetId: id, userId: user.id, username: user.username }) },
     activeTargetId
  );

  // Bind typing events to socket hook manually since we refactored
  useEffect(() => {
     if (socket) {
        socket.on('user_typing', onTypingUpdate);
        return () => socket.off('user_typing', onTypingUpdate);
     }
  }, [socket, onTypingUpdate]);

  // Manage socket room subscriptions
  useEffect(() => {
    if (activeTargetId) {
      socketJoinRoom(activeTargetId);
    }
    return () => {
      if (activeTargetId) {
        socketLeaveRoom(activeTargetId);
      }
    };
  }, [activeTargetId, socketJoinRoom, socketLeaveRoom]);

  const handleSendMessage = useCallback((text) => {
     if (activeView.type === 'room') {
        sendMessage(text, activeTargetId);
     } else if (activeView.type === 'dm') {
        const currentDM = dms.find(d => d._id === activeTargetId);
        const otherUser = currentDM?.participants.find(p => p._id !== user.id);
        if (otherUser) {
           sendDM(text, activeTargetId, otherUser._id);
        }
     }
  }, [activeView.type, activeTargetId, sendMessage, sendDM, dms, user]);

  const handleCreateRoom = async (name, description, isPrivate) => {
     const newRoom = await createRoom(name, description, isPrivate);
     setActiveView({ type: 'room', id: newRoom._id });
  };

  const handleJoinRoom = async (roomId) => {
     await joinRoom(roomId);
     setActiveView({ type: 'room', id: roomId });
  };

  const handleSelectUserDM = async (userId) => {
     const dm = await startDM(userId);
     setActiveView({ type: 'dm', id: dm._id });
  };

  if (!user) {
    return (
      <AuthPage
        onLogin={login}
        onRegister={register}
        loading={loading}
        error={error}
        setError={setError}
      />
    );
  }

  const activeRoom = activeView.type === 'room' ? rooms.find(r => r._id === activeTargetId) : null;
  const activeDM = activeView.type === 'dm' ? dms.find(d => d._id === activeTargetId) : null;
  const currentTypingUsers = typingData[activeTargetId] || [];

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{background:'#07080f'}}>
      {/* Animated background canvas (orbs only) */}
      <div className="glass-canvas absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
      </div>

      {/* UI layer */}
      <div className="relative z-10 flex h-full w-full overflow-hidden">
        <Sidebar 
        user={user}
        rooms={rooms}
        dms={dms}
        activeView={activeView}
        onSelectView={(type, id) => setActiveView({ type, id })}
        onOpenCreateRoom={() => setShowCreateRoom(true)}
        onOpenRoomBrowser={() => setShowRoomBrowser(true)}
        onOpenUserBrowser={() => setShowUserBrowser(true)}
        onLogout={logout}
      />

      <div className="flex-1 min-w-0 relative h-full flex flex-col">
         {activeView.type === 'room' && activeRoom ? (
            <RoomView 
              room={activeRoom}
              messages={messages}
              currentUser={user}
              loading={historyLoading}
              onSendMessage={handleSendMessage}
              onTyping={handleInput}
              typingUsers={currentTypingUsers}
            />
         ) : activeView.type === 'dm' && activeDM ? (
            <DMView 
              dm={activeDM}
              messages={messages}
              currentUser={user}
              loading={historyLoading}
              onSendMessage={handleSendMessage}
              onTyping={handleInput}
              typingUsers={currentTypingUsers}
            />
         ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-5xl mb-4">💬</div>
                <p className="text-surface-400 text-sm">Select a room or start a conversation</p>
              </div>
            </div>
         )}
      </div>

      <UserList users={onlineUsers} currentUser={user} onStartDM={handleSelectUserDM} />

      {showRoomBrowser && (
         <RoomBrowser 
            onClose={() => setShowRoomBrowser(false)}
            onJoin={handleJoinRoom}
            userRooms={rooms}
         />
      )}

      {showUserBrowser && (
         <UserBrowser
            onClose={() => setShowUserBrowser(false)}
            onStartDM={handleSelectUserDM}
            token={token}
         />
      )}

      {showCreateRoom && (
         <CreateRoomModal 
            onClose={() => setShowCreateRoom(false)}
            onCreate={handleCreateRoom}
         />
      )}
      </div>
    </div>
  );
}

export default App;
