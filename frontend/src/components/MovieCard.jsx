import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Film, Tv } from 'lucide-react';
import { getPosterUrl } from '../config';

/**
 * Realistic AICanvas 3D Perspective Glass Movie Card Component
 * Features:
 * - Dynamic Cursor-Tracking Glare Highlight
 * - 3D Spring Tilt Physics
 * - Liquid Glass Animated Sheen Sweep
 * - Multi-Tier Specular Inset Rim Highlight
 */
export default function MovieCard({ movie, featured = false }) {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const mediaType = movie.media_type || (movie.name ? 'tv' : 'movie');
  const title = movie.title || movie.name;

  const year = (movie.release_date || movie.first_air_date) 
    ? new Date(movie.release_date || movie.first_air_date).getFullYear() 
    : '';

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Smooth subtle 6 degree tilt limit
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    
    setRotate({ x: rotateX, y: rotateY });
    setGlarePos({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <Link 
      to={`/media/${mediaType}/${movie.id}`} 
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative block rounded-2xl overflow-hidden glass-card glass-sheen-active transition-all duration-300 select-none focus-visible:outline-none ${
        featured ? 'ring-2 ring-[#e50914] shadow-[0_0_35px_rgba(229,9,20,0.45)]' : ''
      }`}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateY(-6px) scale3d(1.02, 1.02, 1.02)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)',
      }}
    >
      {/* Dynamic Cursor Glare Highlight Layer */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-200"
          style={{
            background: `radial-gradient(280px circle at ${glarePos.x}px ${glarePos.y}px, rgba(255, 255, 255, 0.22), rgba(229, 9, 20, 0.08) 40%, transparent 70%)`,
          }}
        />
      )}

      {/* Poster Image Area */}
      <div className="aspect-[2/3] w-full overflow-hidden relative bg-[#070709]">
        {movie.poster_path ? (
          <img
            src={getPosterUrl(movie.poster_path, 'w500')}
            alt={title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=500&auto=format&fit=crop';
            }}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-xs font-mono font-medium text-slate-400 bg-[#121218]">
            <Film className="w-8 h-8 mb-2 opacity-60 text-[#ff5500]" />
            <span className="line-clamp-2 text-white font-semibold">{title}</span>
          </div>
        )}

        {/* Ambient Vignette Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-transparent to-black/30 opacity-85 group-hover:opacity-60 transition-opacity" />

        {/* Media type badge with Apple frosted glass */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-xl border border-white/15 text-[9px] font-mono font-semibold text-slate-200 uppercase shadow-sm">
            {mediaType === 'tv' ? <Tv className="w-2.5 h-2.5 text-[#ffb800]" /> : <Film className="w-2.5 h-2.5 text-[#e50914]" />}
            <span>{mediaType === 'tv' ? 'Series' : 'Film'}</span>
          </span>
        </div>

        {/* TMDB Rating floating badge */}
        {movie.vote_average ? (
          <div className="absolute bottom-2.5 right-2.5 z-10 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-black/75 backdrop-blur-xl border border-[#ffb800]/40 text-[#ffb800] font-mono text-[10px] font-bold shadow-md">
            <Star className="w-2.5 h-2.5 fill-[#ffb800] text-[#ffb800]" />
            <span>{movie.vote_average.toFixed(1)}</span>
          </div>
        ) : null}
      </div>

      {/* Card Info Area */}
      <div className="p-3 text-left bg-gradient-to-b from-[#111116] to-[#0a0a0d] relative z-20">
        <h3 className="font-display font-bold text-[13px] text-slate-100 group-hover:text-[#ff3b47] transition-colors leading-snug line-clamp-2 h-[2.5rem]">
          {title}
        </h3>
        <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-slate-400">
          <span>{year || 'Cinema'}</span>
          {movie.popularity && (
            <span className="text-slate-500 font-normal">
              {Math.round(movie.popularity)} pts
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
