import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Search, Hash } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const RoomBrowser = ({ onClose, onJoin, userRooms }) => {
  const [allRooms, setAllRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/rooms`)
      .then(res => {
        setAllRooms(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredRooms = allRooms.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
  const userRoomIds = new Set(userRooms.map(r => r._id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-2xl bg-surface-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Browse Rooms</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
            <input
              type="text"
              placeholder="Search rooms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-800 text-surface-100 placeholder-surface-500 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none border border-white/5 focus:border-primary-500/60 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="text-center text-surface-500 py-8 text-sm">Loading rooms...</div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center text-surface-500 py-8 text-sm">No rooms found.</div>
          ) : (
            <ul className="space-y-1">
              {filteredRooms.map(room => {
                const isMember = userRoomIds.has(room._id);
                return (
                  <li key={room._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-700 flex items-center justify-center text-surface-300">
                        <Hash size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{room.name}</h3>
                        <p className="text-xs text-surface-400 truncate max-w-xs">{room.description || 'No description'}</p>
                      </div>
                    </div>
                    {isMember ? (
                      <span className="text-xs text-emerald-400 font-medium px-3 py-1.5 bg-emerald-400/10 rounded-lg">Joined</span>
                    ) : (
                      <button 
                        onClick={() => { onJoin(room._id); onClose(); }}
                        className="text-xs bg-primary-600 hover:bg-primary-500 text-white font-medium px-4 py-1.5 rounded-lg transition-colors"
                      >
                        Join
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomBrowser;
