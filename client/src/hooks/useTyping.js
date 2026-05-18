import { useState, useCallback, useRef, useEffect } from 'react';

export const useTyping = (socket, activeTargetId) => {
  const [typingData, setTypingData] = useState({});
  const typingTimeoutRef = useRef(null);

  const handleInput = useCallback(() => {
    if (!activeTargetId || !socket) return;
    
    socket.emitTypingStart(activeTargetId);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emitTypingStop(activeTargetId);
    }, 2000);
  }, [activeTargetId, socket]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (activeTargetId && socket) {
         socket.emitTypingStop(activeTargetId);
      }
    };
  }, [activeTargetId, socket]);

  const onTypingUpdate = useCallback((data) => {
     setTypingData(prev => ({
        ...prev,
        [data.targetId]: data.typers
     }));
  }, []);

  return { handleInput, typingData, onTypingUpdate };
};
