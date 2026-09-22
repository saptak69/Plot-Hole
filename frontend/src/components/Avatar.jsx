import React, { useState } from 'react';
import { API_URL } from '../config';

/**
 * Avatar Component
 * Clean, seamless cinema avatar with smooth shape inheritance and custom image support.
 */
export default function Avatar({ username, url, className = "w-8 h-8", rounded = "rounded-full" }) {
  const [imageError, setImageError] = useState(false);
  const firstLetter = username ? username.trim().charAt(0).toUpperCase() : '?';
  
  // Resolve relative /uploads paths
  const resolvedUrl = url && url.startsWith('/uploads')
    ? `${API_URL.replace('/api', '')}${url}`
    : url;

  // Check if url is a valid custom avatar
  const hasCustomAvatar = resolvedUrl && 
    !imageError &&
    !resolvedUrl.includes('dicebear.com') && 
    !resolvedUrl.includes('placeholder') && 
    resolvedUrl.trim().length > 0;

  const bgGradient = username ? stringToGradient(username) : 'from-[#e50914] to-[#ffb800]';
  const roundClass = className.includes('rounded-') ? '' : rounded;

  if (hasCustomAvatar) {
    return (
      <img
        src={resolvedUrl}
        alt={username || 'Avatar'}
        onError={() => setImageError(true)}
        className={`${className} ${roundClass} object-cover shrink-0 select-none block`}
      />
    );
  }

  return (
    <div
      className={`${className} ${roundClass} shrink-0 flex items-center justify-center font-display font-black text-white select-none bg-gradient-to-br ${bgGradient}`}
    >
      <span className="text-[55%] leading-none drop-shadow-sm">{firstLetter}</span>
    </div>
  );
}

function stringToGradient(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Luxury cinema color pairs (Netflix Red & Gold Aesthetic)
  const gradients = [
    'from-[#e50914] via-[#ff2e3b] to-[#ffb800]', // Netflix Red & Cinema Gold
    'from-[#b80710] via-[#e50914] to-[#f59e0b]', // Deep Ruby & Amber
    'from-rose-500 via-rose-600 to-amber-500',   // Crimson & Amber
    'from-[#ff2e3b] via-[#ff3b5c] to-[#ff7b88]', // Scarlet Luster
    'from-amber-400 via-amber-500 to-[#e50914]', // Gold & Red
    'from-[#1e1e26] via-[#2a2a38] to-[#e50914]', // Obsidian & Red Spotlight
    'from-red-600 via-orange-500 to-amber-400',  // Fiery Cinema
    'from-slate-600 via-slate-700 to-slate-900'  // Slate Titanium
  ];
  
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}
