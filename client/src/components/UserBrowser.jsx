import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Search, User as UserIcon } from 'lucide-react';
import { API_URL } from '../config';

const UserBrowser = ({ onClose, onStartDM, token }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    axios.get(`${API_URL}/auth/users?search=${search}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setUsers(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [search, token]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-2xl bg-surface-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Find Users</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
            <input
              type="text"
              placeholder="Search by username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-800 text-surface-100 placeholder-surface-500 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none border border-white/5 focus:border-primary-500/60 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="text-center text-surface-500 py-8 text-sm">Searching...</div>
          ) : users.length === 0 ? (
            <div className="text-center text-surface-500 py-8 text-sm">No users found.</div>
          ) : (
            <ul className="space-y-1">
              {users.map(u => (
                <li key={u.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{u.username}</h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => { onStartDM(u.id); onClose(); }}
                    className="text-xs bg-primary-600 hover:bg-primary-500 text-white font-medium px-4 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <UserIcon size={14} /> Message
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserBrowser;
