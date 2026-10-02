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

  const bgGradient = username ? stringToGradient(username) : 'bg-bg-surface text-accent border border-border';
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
      className={`${className} ${roundClass} shrink-0 flex items-center justify-center font-display font-black select-none ${bgGradient}`}
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
  
  const themes = [
    'bg-bg-surface text-text-primary border border-border',
    'bg-bg-hover text-accent border border-border',
    'bg-bg-elevated text-text-secondary border border-border',
    'bg-bg-surface text-accent-hover border border-border',
    'bg-bg-elevated text-text-primary border border-border',
  ];
  
  const index = Math.abs(hash) % themes.length;
  return themes[index];
}
