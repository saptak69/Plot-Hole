import React, { useState } from 'react';
import { ListPlus, Loader2 } from 'lucide-react';
import { API_URL } from '../config';
import { useToast } from '../context/ToastContext';
import GlassModal from './GlassModal';

export default function CreateListModal({ isOpen, onClose, onListCreated }) {
  const { addToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('List title is required', 'error');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('plothole_token');

    try {
      const res = await fetch(`${API_URL}/lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim()
        })
      });

      if (res.ok) {
        const newList = await res.json();
        addToast('Custom list created!', 'success');
        setTitle('');
        setDescription('');
        if (onListCreated) onListCreated(newList);
        onClose();
      } else {
        const err = await res.json();
        addToast(err.error || 'Failed to create list', 'error');
      }
    } catch (err) {
      addToast('Network error creating list', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Cinema List"
      subtitle="Curate and organize your favorite films into a custom collection."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-200 text-left">
        <div>
          <label className="block font-mono font-bold uppercase tracking-wider text-[11px] mb-1.5 text-slate-300">
            List Title *
          </label>
          <input
            type="text"
            placeholder="e.g. Essential 90s Noir Thrillers"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-black/60 border border-white/12 rounded-2xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#e50914] transition-all font-sans shadow-inner"
            required
          />
        </div>

        <div>
          <label className="block font-mono font-bold uppercase tracking-wider text-[11px] mb-1.5 text-slate-300">
            Description (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="A curated collection of gritty, dark cinema masterpieces..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-black/60 border border-white/12 rounded-2xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#e50914] transition-all leading-relaxed font-sans shadow-inner"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs px-4 py-2.5 rounded-2xl cursor-pointer font-display font-bold uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary text-xs px-5 py-2.5 rounded-2xl flex items-center gap-2 font-display font-bold uppercase tracking-wider shadow-md cursor-pointer"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ListPlus className="w-3.5 h-3.5" />}
            <span>Create List</span>
          </button>
        </div>
      </form>
    </GlassModal>
  );
}

