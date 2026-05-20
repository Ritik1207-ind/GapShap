import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';

export const useSocket = ({ user, onReceiveMessage, onUsersUpdate, onTypingUpdate }) => {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  const onReceiveMessageRef = useRef(onReceiveMessage);
  const onUsersUpdateRef = useRef(onUsersUpdate);
  const onTypingUpdateRef = useRef(onTypingUpdate);

  // Keep refs up to date on every render
  useEffect(() => {
    onReceiveMessageRef.current = onReceiveMessage;
  }, [onReceiveMessage]);

  useEffect(() => {
    onUsersUpdateRef.current = onUsersUpdate;
  }, [onUsersUpdate]);

  useEffect(() => {
    onTypingUpdateRef.current = onTypingUpdate;
  }, [onTypingUpdate]);

  useEffect(() => {
    if (!user) return;

    const newSocket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = newSocket;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      newSocket.emit('user_connected', { id: user.id, username: user.username });
    });

    newSocket.on('receive_message', (message) => {
      onReceiveMessageRef.current?.(message);
    });

    newSocket.on('user_online', (users) => {
      if (onUsersUpdateRef.current) onUsersUpdateRef.current(users);
    });

    newSocket.on('user_typing', (data) => {
      if (onTypingUpdateRef.current) onTypingUpdateRef.current(data);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const joinRoom = useCallback((targetId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_room', { targetId });
    }
  }, []);

  const leaveRoom = useCallback((targetId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_room', { targetId });
    }
  }, []);

  const sendMessage = useCallback((text, roomId) => {
    if (socketRef.current && user) {
      socketRef.current.emit('send_message', {
        text,
        userId: user.id,
        username: user.username,
        roomId
      });
    }
  }, [user]);

  const sendDM = useCallback((text, dmId, toUserId) => {
    if (socketRef.current && user) {
      socketRef.current.emit('send_dm', {
        text,
        userId: user.id,
        username: user.username,
        dmId,
        toUserId
      });
    }
  }, [user]);

  const emitTypingStart = useCallback((targetId) => {
    if (socketRef.current && user) {
      socketRef.current.emit('typing_start', {
        targetId,
        userId: user.id,
        username: user.username
      });
    }
  }, [user]);

  const emitTypingStop = useCallback((targetId) => {
    if (socketRef.current && user) {
      socketRef.current.emit('typing_stop', {
        targetId,
        userId: user.id,
        username: user.username
      });
    }
  }, [user]);

  return { socket, joinRoom, leaveRoom, sendMessage, sendDM, emitTypingStart, emitTypingStop };
};
