import { useState } from 'react';
import { Send } from 'lucide-react';

const MessageInput = ({ onSend, onInput }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (onInput) onInput();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="glass-input-wrap flex-shrink-0 flex items-center gap-3 p-3 mx-4 mb-4 rounded-2xl">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 w-full"
      >
        <input
          id="message-input"
          type="text"
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          autoComplete="off"
          className="flex-1 bg-transparent text-surface-100 placeholder-surface-500 py-2 px-1 text-sm outline-none"
        />
        <button
          id="send-button"
          type="submit"
          disabled={!text.trim()}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 glow-primary flex-shrink-0"
        >
          <Send size={15} className="text-white" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
