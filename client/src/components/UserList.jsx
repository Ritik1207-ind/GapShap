import { Users } from 'lucide-react';

const UserList = ({ users, currentUser, onStartDM }) => {
  return (
    <aside className="glass-sidebar w-64 flex-shrink-0 flex flex-col h-full">
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-2 text-surface-300">
          <Users size={15} />
          <span className="text-xs font-semibold uppercase tracking-widest">
            Online — {users.length}
          </span>
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto p-3 space-y-1">
        {users.map((u) => {
          const isCurrentUser = u.id === currentUser?.id;
          return (
            <li key={u.id}>
              <button
                onClick={() => !isCurrentUser && onStartDM(u.id)}
                disabled={isCurrentUser}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 ${
                  isCurrentUser ? 'cursor-default' : 'hover:bg-surface-800 cursor-pointer'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold select-none">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#07080f] animate-pulse-dot" />
                </div>

                {/* Name */}
                <span className={`text-sm truncate ${isCurrentUser ? 'text-primary-300 font-medium' : 'text-surface-200'}`}>
                  {u.username}
                  {isCurrentUser && (
                    <span className="ml-1 text-xs text-surface-500">(you)</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}

        {users.length === 0 && (
          <li className="text-center text-surface-500 text-xs mt-8">
            No one online yet
          </li>
        )}
      </ul>
    </aside>
  );
};

export default UserList;
