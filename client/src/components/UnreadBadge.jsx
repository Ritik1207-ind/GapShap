const UnreadBadge = ({ count }) => {
  if (!count || count === 0) return null;
  return (
    <span className="flex items-center justify-center w-5 h-5 ml-auto text-[10px] font-bold text-white bg-primary-600 rounded-full glow-primary">
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default UnreadBadge;
