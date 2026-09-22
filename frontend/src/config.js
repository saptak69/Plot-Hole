const rawApiUrl = (import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:5000/api`
    : 'http://localhost:5000/api'
)).trim().replace(/\/+$/, '');

// Ensure /api endpoint suffix is always present
export const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Helper to get image URLs
export function getPosterUrl(path, size = 'w342') {
  if (!path || path === 'null' || path === 'undefined' || path.trim() === '') {
    return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=342&auto=format&fit=crop';
  }
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${TMDB_IMAGE_BASE}/${size}${cleanPath}`;
}

export function getBackdropUrl(path, size = 'w1280') {
  if (!path) return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1280&auto=format&fit=crop';
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

// Authentication token helper
export function getAuthHeaders() {
  const token = localStorage.getItem('plothole_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Custom PlotHole 4-Tier Sentiment Rating System (Inspired by Moctale, elevated with Red/Orange/Charcoal branding)
export const RATINGS = {
  1: { id: 'skip', tier: 1, label: 'Skip', icon: 'XCircle', color: 'rate-skip', hex: '#ff3b5c', textHex: '#ff8a9e', bgHex: 'rgba(255, 59, 92, 0.15)' },
  2: { id: 'timepass', tier: 2, label: 'Timepass', icon: 'Clock', color: 'rate-timepass', hex: '#f59e0b', textHex: '#fcd34d', bgHex: 'rgba(245, 158, 11, 0.15)' },
  3: { id: 'goforit', tier: 3, label: 'Go For It', icon: 'Flame', color: 'rate-goforit', hex: '#ff6b00', textHex: '#ffa033', bgHex: 'rgba(255, 107, 0, 0.18)' },
  4: { id: 'perfection', tier: 4, label: 'Perfection', icon: 'Sparkles', color: 'rate-perfection', hex: '#e50914', textHex: '#ffffff', bgHex: 'linear-gradient(135deg, rgba(229, 9, 20, 0.35), rgba(255, 107, 0, 0.35))' },
  5: { id: 'perfection', tier: 4, label: 'Perfection', icon: 'Sparkles', color: 'rate-perfection', hex: '#e50914', textHex: '#ffffff', bgHex: 'linear-gradient(135deg, rgba(229, 9, 20, 0.35), rgba(255, 107, 0, 0.35))' }
};

export const SENTIMENT_TIERS = [
  { id: 'skip', value: 1, label: 'Skip', desc: 'Not recommended', icon: 'XCircle', hex: '#ff3b5c', activeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_2px_12px_rgba(255,59,92,0.25)]' },
  { id: 'timepass', value: 2, label: 'Timepass', desc: 'Casual watch', icon: 'Clock', hex: '#f59e0b', activeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_2px_12px_rgba(245,158,11,0.25)]' },
  { id: 'goforit', value: 3, label: 'Go For It', desc: 'Solid pick', icon: 'Flame', hex: '#ff6b00', activeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-[0_2px_12px_rgba(255,107,0,0.3)]' },
  { id: 'perfection', value: 4, label: 'Perfection', desc: 'Masterpiece', icon: 'Sparkles', hex: '#e50914', activeBg: 'bg-gradient-to-r from-[#e50914]/30 via-[#ff6b00]/30 to-white/20 text-white border-[#ff6b00]/60 shadow-[0_2px_18px_rgba(229,9,20,0.35)]' }
];

export function getRatingInfo(value) {
  const val = Math.round(value);
  return RATINGS[val] || { id: 'unrated', tier: 0, label: 'Unrated', icon: 'HelpCircle', color: 'brand-text-muted', hex: '#64748b' };
}

