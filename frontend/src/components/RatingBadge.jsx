import React from 'react';
import { AlertOctagon, MinusCircle, Ticket, ThumbsUp, Trophy, Star } from 'lucide-react';
import { getRatingInfo } from '../config';

export default function RatingBadge({ rating, size = 'sm', showIcon = true, className = '' }) {
  const normalizeRating = (r) => {
    if (typeof r === 'number' || !isNaN(Number(r))) return Number(r);
    const legacyMap = {
      'bullshit': 1,
      'meh': 1,
      'skip': 1,
      'one-time': 2,
      'timepass': 2,
      'good watch': 3,
      'go for it': 3,
      'pure cinema': 4,
      'perfection': 4
    };
    return legacyMap[r?.toString().toLowerCase()] || r;
  };

  const normalizedRating = normalizeRating(rating);
  const ratingInfo = getRatingInfo(normalizedRating);
  
  // Red, Orange, Amber & Charcoal Cinema Rating Badges
  const tierConfig = {
    1: {
      style: 'bg-bg-surface text-text-muted border-border hover:border-border-hover shadow-none',
      icon: AlertOctagon,
      label: 'Skip'
    },
    2: {
      style: 'bg-bg-surface text-text-secondary border-border hover:border-border-hover shadow-none',
      icon: MinusCircle,
      label: 'Timepass'
    },
    3: {
      style: 'bg-bg-surface text-text-primary border-border hover:border-border-hover shadow-none',
      icon: ThumbsUp,
      label: 'Go For It'
    },
    4: {
      style: 'bg-accent/10 text-accent border-accent/30 shadow-[0_0_10px_rgba(229,9,20,0.15)] hover:border-accent/50',
      icon: Trophy,
      label: 'Perfection'
    },
    5: {
      style: 'bg-accent/10 text-accent border-accent/30 shadow-[0_0_10px_rgba(229,9,20,0.15)] hover:border-accent/50',
      icon: Trophy,
      label: 'Perfection'
    }
  };


  const currentTier = tierConfig[normalizedRating] || {
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
