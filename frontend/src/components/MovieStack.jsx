import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Film, RefreshCw, Eye } from 'lucide-react';
import { getPosterUrl } from '../config';
import GlassSurface from './GlassSurface';

/**
 * MovieStack Component
 * Interactive cinema mystery deck with rotational depth and tactile fanning.
 */
export default function MovieStack({ movies = [], title = 'Cinephile Mystery Deck' }) {
  const [cards, setCards] = useState(movies.slice(0, 5));
  const [activeIdx, setActiveIdx] = useState(0);

  // Sync if movies change
  React.useEffect(() => {
    if (movies.length > 0) {
      setCards(movies.slice(0, 5));
      setActiveIdx(0);
    }
  }, [movies]);

  if (!cards || cards.length === 0) return null;

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % cards.length);
  };

  const activeMovie = cards[activeIdx] || cards[0];
  const movieTitle = activeMovie.title || activeMovie.name;
  const rating = activeMovie.vote_average ? activeMovie.vote_average.toFixed(1) : '8.5';
  const mediaType = activeMovie.media_type || 'movie';

  return (
    <GlassSurface
      width="100%"
      height="auto"
      borderRadius={32}
      backgroundOpacity={0.4}
      blur={20}
      borderOpacity={0.14}
      className="shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(229,9,20,0.06)] overflow-hidden"
    >
      <div className="p-6 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 w-full text-left">
        {/* Left info column */}
        <div className="text-left space-y-4 max-w-md w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e50914]/12 border border-[#e50914]/30 text-[#ff4d5a] font-mono text-[11px] font-semibold uppercase tracking-wider shadow-sm">
            <Film className="w-3.5 h-3.5 text-[#ff4d5a]" />
            <span>Mystery Spotlight // Blind Pick</span>
          </div>

          <h3 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white leading-tight">
            {movieTitle}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 font-sans line-clamp-3 leading-relaxed">
            {activeMovie.overview || "A compelling cinematic journey through timeless storytelling and visual mastery."}
          </p>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 font-mono text-xs text-[#ffb800] font-bold">
              <Star className="w-3.5 h-3.5 fill-[#ffb800] text-[#ffb800]" />
              <span>{rating} TMDB</span>
            </div>

            <span className="text-xs font-mono text-slate-400">
              Card {activeIdx + 1} of {cards.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              to={`/media/${mediaType}/${activeMovie.id}`}
              className="btn-primary px-5 py-2.5 text-xs font-display font-bold uppercase tracking-wider flex items-center gap-2 shadow-md"
            >
              <Eye className="w-4 h-4" />
              <span>Explore Film</span>
            </Link>

            <button
              onClick={handleNext}
              className="btn-secondary px-4 py-2.5 text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Next Card</span>
            </button>
          </div>
        </div>

        {/* Right Stack Cards Visual */}
        <div className="relative w-56 h-80 sm:w-64 sm:h-92 cursor-pointer select-none mx-auto lg:mx-0 my-4" onClick={handleNext}>
          {cards.map((movie, index) => {
            const offset = (index - activeIdx + cards.length) % cards.length;
            if (offset > 3) return null; // Show top 4 layers

            // Dynamic rotation and depth offsets
            const rotations = [0, 4, -4, 8];
            const translateYs = [0, 10, 20, 30];
            const scales = [1, 0.94, 0.88, 0.82];
            const opacities = [1, 0.75, 0.5, 0.3];

            return (
              <div
                key={movie.id}
                className="absolute inset-0 rounded-2xl overflow-hidden border border-white/15 shadow-2xl transition-all duration-300 ease-out bg-slate-900"
                style={{
                  transform: `translate3d(0, ${translateYs[offset]}px, 0) rotate(${rotations[offset]}deg) scale(${scales[offset]})`,
                  zIndex: 10 - offset,
                  opacity: opacities[offset]
                }}
              >
                <img
                  src={getPosterUrl(movie.poster_path, 'w342')}
                  alt={movie.title || movie.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
                
                {offset === 0 && (
                  <div className="absolute bottom-3 inset-x-3 text-left">
                    <span className="font-display font-bold text-xs text-white line-clamp-1 drop-shadow">
                      {movie.title || movie.name}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </GlassSurface>
  );
}
