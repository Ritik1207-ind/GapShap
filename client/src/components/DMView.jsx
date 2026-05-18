import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';

const DMView = ({ dm, messages, currentUser, loading, onSendMessage, onTyping, typingUsers }) => {
  if (!dm) return null;

  const otherUser = dm.participants.find(p => p._id !== currentUser.id);

  return (
    <div className="flex flex-col h-full w-full bg-transparent">
      <header className="flex items-center px-6 py-4 border-b border-white/5 glass z-10 flex-shrink-0">
        <div className="relative mr-4">
           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white font-bold text-lg">
             {otherUser?.username.charAt(0).toUpperCase()}
           </div>
           <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-transparent animate-pulse-dot" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg leading-tight">{otherUser?.username}</h2>
          <p className="text-surface-400 text-xs mt-0.5 text-emerald-400">Online</p>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 relative">
        <div className="flex flex-col flex-1 min-w-0">
          <ChatWindow
            messages={messages}
            currentUser={currentUser}
            loading={loading}
            typingUsers={typingUsers}
          />
          <MessageInput onSend={onSendMessage} onInput={onTyping} />
        </div>
      </div>
    </div>
  );
};

export default DMView;
