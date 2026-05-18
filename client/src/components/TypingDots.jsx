const TypingDots = ({ typers = [] }) => {
  if (typers.length === 0) return null;
  
  const text = typers.length === 1 
    ? `${typers[0]} is typing...` 
    : typers.length === 2 
      ? `${typers[0]} and ${typers[1]} are typing...`
      : 'Several people are typing...';

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs text-surface-400 animate-fade-in">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-surface-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span>{text}</span>
    </div>
  );
};

export default TypingDots;
