import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import { Hash } from 'lucide-react';

const RoomView = ({ room, messages, currentUser, loading, onSendMessage, onTyping, typingUsers }) => {
  if (!room) return null;

  return (
    <div className="flex flex-col h-full w-full bg-transparent">
      <header className="flex items-center px-6 py-4 border-b border-white/5 glass z-10 flex-shrink-0">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-800 text-surface-400 mr-4">
          <Hash size={20} />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg leading-tight">{room.name}</h2>
          <p className="text-surface-400 text-xs mt-0.5">{room.description || 'No description provided'}</p>
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

export default RoomView;
