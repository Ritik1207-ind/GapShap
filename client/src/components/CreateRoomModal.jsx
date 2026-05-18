import { useState } from 'react';
import { X } from 'lucide-react';

const CreateRoomModal = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await onCreate(name.trim(), description.trim(), false);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-surface-900 border border-white/10 rounded-2xl shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-surface-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-6">Create a New Room</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1.5 uppercase">Room Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. general, help, random"
              className="w-full bg-surface-800 text-surface-100 placeholder-surface-500 rounded-xl px-4 py-3 text-sm outline-none border border-white/5 focus:border-primary-500/60 focus:ring-1 focus:ring-primary-500/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1.5 uppercase">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this room about?"
              className="w-full bg-surface-800 text-surface-100 placeholder-surface-500 rounded-xl px-4 py-3 text-sm outline-none border border-white/5 focus:border-primary-500/60 focus:ring-1 focus:ring-primary-500/30 transition-all"
            />
          </div>
          {/* Private toggle can be added later, keeping it simple for now */}
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-surface-300 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim()} className="bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl px-6 py-2 text-sm transition-all disabled:opacity-50">
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
