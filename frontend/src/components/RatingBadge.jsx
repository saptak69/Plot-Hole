import React from 'react';
import { AlertOctagon, MinusCircle, Ticket, ThumbsUp, Trophy, Star } from 'lucide-react';
import { getRatingInfo } from '../config';

export default function RatingBadge({ rating, size = 'sm', showIcon = true, className = '' }) {
  const ratingInfo = getRatingInfo(rating);
  
  // Red, Orange, Amber & Charcoal Cinema Rating Badges
  const tierConfig = {
    1: {
      style: 'bg-rose-500/15 text-rose-300 border-rose-500/35 shadow-[0_2px_10px_rgba(244,63,94,0.18)] hover:border-rose-400',
      icon: AlertOctagon,
      label: 'Skip'
    },
    2: {
      style: 'bg-amber-500/15 text-amber-300 border-amber-500/35 shadow-[0_2px_10px_rgba(245,158,11,0.2)] hover:border-amber-400',
      icon: MinusCircle,
      label: 'Timepass'
    },
    3: {
      style: 'bg-orange-500/18 text-orange-300 border-orange-500/40 shadow-[0_2px_12px_rgba(255,107,0,0.25)] hover:border-orange-400',
      icon: ThumbsUp,
      label: 'Go For It'
    },
    4: {
      style: 'bg-gradient-to-r from-[#e50914]/25 via-[#ff6b00]/25 to-white/20 text-white border-[#ff6b00]/50 shadow-[0_2px_14px_rgba(229,9,20,0.3)] hover:border-white/60',
      icon: Trophy,
      label: 'Perfection'
    },
    5: {
      style: 'bg-gradient-to-r from-[#e50914]/25 via-[#ff6b00]/25 to-white/20 text-white border-[#ff6b00]/50 shadow-[0_2px_14px_rgba(229,9,20,0.3)] hover:border-white/60',
      icon: Trophy,
      label: 'Perfection'
    }
  };


  const currentTier = tierConfig[rating] || {
    style: 'bg-white/6 text-slate-300 border-white/10',
    icon: Star,
    label: ratingInfo?.label || 'Rating'
  };

  const IconComponent = currentTier.icon;

  const sizeClasses = size === 'lg' 
    ? 'px-3.5 py-1.5 text-xs gap-1.5 tracking-wider' 
    : size === 'xs'
    ? 'px-2 py-0.5 text-[9px] gap-1 tracking-wide' 
    : 'px-2.5 py-1 text-[10px] gap-1.5 tracking-wider';

  const iconSizes = size === 'lg' 
    ? 'w-3.5 h-3.5' 
    : size === 'xs'
    ? 'w-2.5 h-2.5'
    : 'w-3 h-3';

  return (
    <div
      className={`inline-flex items-center font-mono font-semibold uppercase rounded-full border backdrop-blur-xl transition-all duration-200 select-none ${sizeClasses} ${currentTier.style} ${className}`}
    >
      {showIcon && <IconComponent className={`${iconSizes} shrink-0`} />}
      <span className="truncate">{currentTier.label}</span>
    </div>
  );
}
