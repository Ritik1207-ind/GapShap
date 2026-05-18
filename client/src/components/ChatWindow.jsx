import { useEffect, useRef } from 'react';
import TypingDots from './TypingDots';

const formatTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (ts) => {
  const d = new Date(ts);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'long', day: 'numeric' });
};

const ChatWindow = ({ messages, currentUser, loading, typingUsers = [] }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Group messages by date

  return (
    <div className="glass-chat flex-1 overflow-y-auto px-4 py-4 space-y-1">
      {loading && (
        <div className="flex justify-center py-8">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {messages.map((msg, idx) => {
        const msgDate = formatDate(msg.timestamp);
        const prevMsgDate = idx > 0 ? formatDate(messages[idx - 1].timestamp) : null;
        const showDate = msgDate !== prevMsgDate;

        const isOwn = msg.sender._id === currentUser?.id || msg.sender.username === currentUser?.username;

        // Group consecutive messages from same sender
        const prevMsg = messages[idx - 1];
        const isContinuation =
          prevMsg &&
          prevMsg.sender.username === msg.sender.username &&
          !showDate;

        return (
          <div key={msg._id || idx} className="animate-slide-up">
            {showDate && (
              <div className="flex items-center gap-3 my-4">
                <hr className="flex-1 border-white/5" />
                <span className="text-xs text-surface-500 font-medium px-2">{msgDate}</span>
                <hr className="flex-1 border-white/5" />
              </div>
            )}

            <div className={`flex items-end gap-2.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${isContinuation ? 'mt-0.5' : 'mt-3'}`}>
              {/* Avatar — only show for first in a run */}
              {!isOwn && (
                <div className={`flex-shrink-0 ${isContinuation ? 'invisible' : ''}`}>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center text-white text-xs font-bold select-none">
                    {msg.sender.username?.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}

              <div className={`flex flex-col gap-0.5 max-w-[68%] ${isOwn ? 'items-end' : 'items-start'}`}>
                {!isContinuation && !isOwn && (
                  <span className="text-xs text-surface-400 ml-1 mb-0.5 font-medium">
                    {msg.sender.username}
                  </span>
                )}
                <div
                  className={`
                    px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words
                    ${isOwn ? 'msg-own text-white rounded-br-sm' : 'msg-other text-surface-100 rounded-bl-sm'}
                  `}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-surface-500 mx-1">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {messages.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-surface-500">
          <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center text-3xl">
            💬
          </div>
          <p className="text-sm">No messages yet. Say hello!</p>
        </div>
      )}

      {typingUsers.length > 0 && <TypingDots typers={typingUsers} />}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;
