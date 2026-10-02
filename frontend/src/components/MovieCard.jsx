import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Film, Tv } from 'lucide-react';
import { getPosterUrl } from '../config';

/**
 * MovieCard — Editorial poster card
 * 
 * Clean, image-forward design. No 3D tilt physics.
 * Hover: subtle lift + border glow. Focus: visible ring.
 * 
 * @param {object} movie - TMDB movie/tv object
 * @param {boolean} featured - Highlight with accent border
 * @param {string} size - 'sm' | 'md' | 'lg' — controls text sizing
 */
export default function MovieCard({ movie, featured = false, size = 'md' }) {
  const mediaType = movie.media_type || (movie.name ? 'tv' : 'movie');
  const title = movie.title || movie.name;
  const year = (movie.release_date || movie.first_air_date)
    ? new Date(movie.release_date || movie.first_air_date).getFullYear()
    : '';

  const sizeClasses = {
    sm: { title: 'text-xs', meta: 'text-[9px]', pad: 'p-2.5', gap: 'mt-0.5' },
    md: { title: 'text-[13px]', meta: 'text-[10px]', pad: 'p-3', gap: 'mt-1' },
    lg: { title: 'text-sm', meta: 'text-xs', pad: 'p-3.5', gap: 'mt-1.5' },
  };

  const s = sizeClasses[size] || sizeClasses.md;

  return (
    <Link
      to={`/media/${mediaType}/${movie.id}`}
      className={`group relative block rounded-xl overflow-hidden bg-bg-elevated border transition-all duration-200 ease-out select-none active:scale-[0.97]
        ${featured
          ? 'border-accent/40 shadow-[0_0_20px_rgba(229,9,20,0.15)]'
          : 'border-border lg:hover:border-border-hover'
        }
        lg:hover:shadow-lg lg:hover:-translate-y-1
      `}
    >
      {/* Poster Image */}
      <div className="aspect-[2/3] w-full overflow-hidden relative bg-bg-primary">
        {movie.poster_path ? (
          <img
            src={getPosterUrl(movie.poster_path, 'w500')}
            alt={`${title} poster`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-300 ease-out lg:group-hover:scale-[1.03]"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}

        {/* Fallback when no poster */}
        <div className={`${movie.poster_path ? 'hidden' : ''} w-full h-full flex flex-col items-center justify-center p-4 text-center bg-bg-elevated`}>
          <Film className="w-8 h-8 mb-2 text-text-muted" />
          <span className="text-xs font-medium text-text-secondary line-clamp-2">{title}</span>
        </div>

        {/* Bottom gradient scrim */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg-elevated to-transparent pointer-events-none" />

        {/* Media type badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[9px] font-mono font-medium text-text-secondary uppercase tracking-wide">
            {mediaType === 'tv'
              ? <><Tv className="w-2.5 h-2.5 text-gold" /><span>Series</span></>
              : <><Film className="w-2.5 h-2.5 text-accent" /><span>Film</span></>
            }
          </span>
        </div>

        {/* TMDB rating */}
        {movie.vote_average ? (
          <div className="absolute bottom-2 right-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-gold font-mono text-[10px] font-semibold">
            <Star className="w-2.5 h-2.5 fill-current" />
            <span>{movie.vote_average.toFixed(1)}</span>
          </div>
        ) : null}
      </div>

      {/* Card Info */}
      <div className={`${s.pad} bg-bg-elevated`}>
        <h3 className={`font-display font-semibold ${s.title} text-text-primary lg:group-hover:text-accent-hover transition-colors leading-snug line-clamp-2 min-h-[2.2em]`}>
          {title}
        </h3>
        <div className={`flex items-center justify-between ${s.gap} font-mono ${s.meta} text-text-muted`}>
          <span>{year || '—'}</span>
          {movie.vote_count > 0 && (
            <span className="text-text-faint">
              {movie.vote_count.toLocaleString()} votes
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
