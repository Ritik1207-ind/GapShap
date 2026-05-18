import { Plus, Hash, MessageSquare, Compass, LogOut, Search } from 'lucide-react';
import UnreadBadge from './UnreadBadge';

const Sidebar = ({ 
  user, 
  rooms, 
  dms, 
  activeView, 
  onSelectView, 
  onOpenCreateRoom, 
  onOpenRoomBrowser,
  onOpenUserBrowser,
  onLogout 
}) => {
  return (
    <aside className="glass-sidebar w-64 h-full flex flex-col flex-shrink-0">
      {/* Header / User Profile */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <MessageSquare size={16} className="text-white" />
            </div>
            <h1 className="text-white font-bold tracking-tight">GapShap</h1>
          </div>
          <button onClick={onLogout} title="Sign out" className="text-surface-500 hover:text-red-400 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-surface-900 border border-white/5">
           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-sm font-bold">
              {user?.username.charAt(0).toUpperCase()}
           </div>
           <div className="flex flex-col min-w-0">
              <span className="text-sm text-white font-medium truncate">{user?.username}</span>
              <span className="text-[10px] text-emerald-400 font-medium">Online</span>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Rooms Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2 group">
            <h2 className="text-xs font-bold text-surface-400 uppercase tracking-wider">Rooms</h2>
            <div className="flex gap-1 transition-opacity">
              <button onClick={onOpenRoomBrowser} title="Browse rooms" className="p-1 text-surface-400 hover:text-white rounded hover:bg-surface-800">
                <Compass size={14} />
              </button>
              <button onClick={onOpenCreateRoom} title="Create room" className="p-1 text-surface-400 hover:text-white rounded hover:bg-surface-800">
                <Plus size={14} />
              </button>
            </div>
          </div>
          <ul className="space-y-0.5">
            {rooms.map(room => {
              const isActive = activeView.type === 'room' && activeView.id === room._id;
              // No unread counts for rooms in this basic setup, but could be added
              return (
                <li key={room._id}>
                  <button
                    onClick={() => onSelectView('room', room._id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                      isActive ? 'bg-primary-500/10 text-primary-300 font-medium' : 'text-surface-300 hover:bg-white/5 hover:text-surface-100'
                    }`}
                  >
                    <Hash size={16} className={isActive ? 'text-primary-400' : 'text-surface-500'} />
                    <span className="truncate">{room.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* DMs Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2 group">
            <h2 className="text-xs font-bold text-surface-400 uppercase tracking-wider">Direct Messages</h2>
            <div className="flex gap-1 transition-opacity">
              <button onClick={onOpenUserBrowser} title="Find users" className="p-1 text-surface-400 hover:text-white rounded hover:bg-surface-800">
                <Search size={14} />
              </button>
            </div>
          </div>
          <ul className="space-y-0.5">
            {dms.map(dm => {
              const isActive = activeView.type === 'dm' && activeView.id === dm._id;
              const otherUser = dm.participants.find(p => p._id !== user.id);
              const unreadCount = dm.unreadCounts ? (dm.unreadCounts[user.id] || 0) : 0;
              
              if (!otherUser) return null;

              return (
                <li key={dm._id}>
                  <button
                    onClick={() => onSelectView('dm', dm._id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                      isActive ? 'bg-primary-500/10 text-primary-300 font-medium' : 'text-surface-300 hover:bg-white/5 hover:text-surface-100'
                    }`}
                  >
                    <div className="relative">
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${isActive ? 'bg-primary-500' : 'bg-surface-700'}`}>
                          {otherUser.username.charAt(0).toUpperCase()}
                       </div>
                       <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border border-transparent" />
                    </div>
                    <span className={`truncate ${unreadCount > 0 && !isActive ? 'text-white font-bold' : ''}`}>
                      {otherUser.username}
                    </span>
                    {!isActive && <UnreadBadge count={unreadCount} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
