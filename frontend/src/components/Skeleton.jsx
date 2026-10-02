import React from 'react';

/**
 * Skeleton — Shimmer loading placeholder
 * Replaces spinner-based loading with content-shaped placeholders.
 * 
 * @param {string} variant - 'text' | 'title' | 'avatar' | 'card' | 'poster' | 'rect'
 * @param {string} className - Additional CSS classes
 * @param {number} count - Number of skeleton items to render
 */
export default function Skeleton({ variant = 'text', className = '', count = 1 }) {
  const baseClasses = 'skeleton-shimmer';

  const variantClasses = {
    text: 'h-4 w-full rounded',
    title: 'h-6 w-3/4 rounded',
    avatar: 'w-10 h-10 rounded-full',
    card: 'w-full aspect-[2/3] rounded-xl',
    poster: 'w-full aspect-[2/3] rounded-lg',
    rect: 'w-full h-32 rounded-xl',
    badge: 'h-6 w-20 rounded-full',
    line: 'h-3 w-full rounded',
  };

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.text} ${className}`}
      aria-hidden="true"
    />
  ));

  if (count === 1) return items[0];

  return <div className="space-y-2">{items}</div>;
}

/**
 * MovieCardSkeleton — Matches the shape of MovieCard
 */
export function MovieCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden" aria-hidden="true">
      <div className="aspect-[2/3] w-full skeleton-shimmer" />
      <div className="p-3 space-y-2 bg-bg-elevated">
        <div className="skeleton-shimmer h-4 w-3/4 rounded" />
        <div className="skeleton-shimmer h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}

/**
 * MovieGridSkeleton — Multiple card skeletons in a grid
 */
export function MovieGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * HeroSkeleton — Matches hero banner shape
 */
export function HeroSkeleton() {
  return (
    <div className="relative w-full aspect-[21/9] max-h-[70vh] skeleton-shimmer rounded-none" aria-hidden="true">
      <div className="absolute bottom-8 left-8 space-y-3">
        <div className="skeleton-shimmer h-10 w-96 max-w-[60vw] rounded" />
        <div className="skeleton-shimmer h-4 w-64 max-w-[40vw] rounded" />
        <div className="flex gap-3">
          <div className="skeleton-shimmer h-10 w-32 rounded-xl" />
          <div className="skeleton-shimmer h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * ReviewSkeleton — Matches review card shape
 */
export function ReviewSkeleton() {
  return (
    <div className="p-5 rounded-xl bg-bg-elevated border border-border space-y-3" aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="skeleton-shimmer w-8 h-8 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <div className="skeleton-shimmer h-3.5 w-24 rounded" />
          <div className="skeleton-shimmer h-3 w-16 rounded" />
        </div>
        <div className="skeleton-shimmer h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="skeleton-shimmer h-3.5 w-full rounded" />
        <div className="skeleton-shimmer h-3.5 w-5/6 rounded" />
        <div className="skeleton-shimmer h-3.5 w-2/3 rounded" />
      </div>
    </div>
  );
}

/**
 * MovieDetailsSkeleton — Detailed skeleton for movie detail page
 */
export function MovieDetailsSkeleton() {
  return (
    <div className="space-y-8 w-full" aria-hidden="true">
      <div className="w-full aspect-[21/9] max-h-[50vh] skeleton-shimmer rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 aspect-[2/3] skeleton-shimmer rounded-2xl" />
        <div className="lg:col-span-2 space-y-4">
          <div className="skeleton-shimmer h-12 w-3/4 rounded-xl" />
          <div className="skeleton-shimmer h-4 w-full rounded" />
          <div className="skeleton-shimmer h-4 w-full rounded" />
          <div className="skeleton-shimmer h-4 w-5/6 rounded" />
          <div className="pt-8 flex gap-4">
             <div className="skeleton-shimmer h-10 w-32 rounded-xl" />
             <div className="skeleton-shimmer h-10 w-32 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
