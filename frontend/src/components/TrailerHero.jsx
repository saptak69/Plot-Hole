import React, { useState, useEffect, useRef } from 'react';
import { Play, Film, Star, Loader2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_URL, getBackdropUrl } from '../config';

/**
 * TrailerHero Component
 * Interactive widescreen trailer player and cinematic backdrop hero header.
 */
export default function TrailerHero({
  movie,
  mediaType = 'movie',
  autoPlayTrailer = false,
  preloadedVideos = null,
  showMeta = true,
  onPrev,
  onNext,
  onTrailerStateChange
}) {
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [videoKey, setVideoKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Smooth Crossfade Double-Buffer State
  const [displayedMovie, setDisplayedMovie] = useState(movie);
  const [isCrossfading, setIsCrossfading] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Touch swipe support for mobile
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Handle smooth movie transition
  useEffect(() => {
    if (!movie?.id) return;

    if (displayedMovie?.id !== movie.id) {
      setIsCrossfading(true);
      setIsImageLoaded(false);
      const timer = setTimeout(() => {
        setDisplayedMovie(movie);
        setIsCrossfading(false);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [movie, displayedMovie?.id]);

  // Extract video details
  useEffect(() => {
    if (!movie?.id) return;
    setIsPlayingTrailer(false);
    setVideoKey(null);
    setError(false);

    const parseTrailer = (videos) => {
      const trailer =
        videos.find((v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) ||
        videos.find((v) => v.site === 'YouTube');

      if (trailer && trailer.key) {
        setVideoKey(trailer.key);
      } else {
        setError(true);
      }
    };

    if (preloadedVideos && Array.isArray(preloadedVideos) && preloadedVideos.length > 0) {
      parseTrailer(preloadedVideos);
      return;
    }

    // Hardcoded guaranteed working keys for the default hero movies
    if (movie.id === 693134) {
      setVideoKey('Way9Dexny3w'); // Dune: Part Two
      return;
    }
    if (movie.id === 872585) {
      setVideoKey('uYPbbksJxIg'); // Oppenheimer
      return;
    }
    if (movie.id === 157336) {
      setVideoKey('zSWdZVtXT7E'); // Interstellar
      return;
    }

    // Fetch videos from backend
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/media/${mediaType}/${movie.id}/videos`);
        if (!res.ok) throw new Error('Could not fetch trailers');
        const data = await res.json();
        parseTrailer(data.results || []);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [movie?.id, mediaType, preloadedVideos]);

  const activeMovie = displayedMovie || movie;
  const displayTitle = activeMovie?.title || activeMovie?.name || 'Featured Title';
  const displayDate = activeMovie?.release_date || activeMovie?.first_air_date || '';
  const year = displayDate ? displayDate.split('-')[0] : '';
  const rating = activeMovie?.vote_average ? activeMovie.vote_average.toFixed(1) : null;
  const backdropUrl = getBackdropUrl(activeMovie?.backdrop_path, 'original');

  const handleStartTrailer = () => {
    setIsPlayingTrailer(true);
    onTrailerStateChange?.(true);
  };

  const handleStopTrailer = () => {
    setIsPlayingTrailer(false);
    onTrailerStateChange?.(false);
  };

  // Touch swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 40; // Min px swipe distance

    if (diff > threshold && onNext) {
      onNext();
    } else if (diff < -threshold && onPrev) {
      onPrev();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-bg-elevated border border-border transition-all duration-300 select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ================= TRAILER PLAYER STATE ================= */}
      {isPlayingTrailer ? (
        <div className="relative aspect-video w-full bg-black flex items-center justify-center animate-fade-in">
          <button
            onClick={handleStopTrailer}
            className="absolute top-4 right-4 z-30 px-4 py-1.5 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-lg"
          >
            ✕ Close Preview
          </button>

          {loading ? (
            <div className="flex flex-col items-center gap-3 text-text-muted font-mono text-xs">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <span>Loading Stream...</span>
            </div>
          ) : error || !videoKey ? (
            <div className="text-center p-6 md:p-8 space-y-3 font-sans max-w-md">
              <Film className="w-10 h-10 text-accent/60 mx-auto mb-2" />
              <h4 className="text-sm font-display font-bold text-text-primary uppercase">
                Trailer Stream Unavailable
              </h4>
              <p className="text-xs text-text-muted">
                No direct stream found. Search directly on YouTube:
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(displayTitle + ' official trailer')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-4"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Search on YouTube</span>
                </a>
                <button
                  onClick={handleStopTrailer}
                  className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  Back
                </button>
              </div>
            </div>
          ) : (
            <iframe
              src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`}
              title={`${displayTitle} Official Trailer`}
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      ) : (
        /* ================= CINEMATIC BACKDROP BANNER WITH CROSSFADE ================= */
        <div className="relative aspect-[4/3] sm:aspect-[16/8] md:aspect-[21/9] min-h-[380px] sm:min-h-[380px] md:min-h-[460px] w-full group overflow-hidden bg-bg-primary">
          {/* Smooth Crossfading Backdrop Image */}
          {backdropUrl ? (
            <>
              {/* Skeleton Placeholder */}
              {!isImageLoaded && (
                <div className="absolute inset-0 bg-bg-elevated skeleton-shimmer z-0" />
              )}
              <img
                key={`bg-${activeMovie?.id}`}
                src={backdropUrl}
                alt={displayTitle}
                onLoad={() => setIsImageLoaded(true)}
                className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${
                  isCrossfading || !isImageLoaded ? 'opacity-40 blur-sm scale-105' : 'opacity-100 blur-0 scale-100'
                }`}
              />
            </>
          ) : (
            <div className="w-full h-full bg-bg-surface" />
          )}

          {/* Scrims */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/80 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/90 via-bg-primary/40 to-transparent pointer-events-none hidden md:block" />

          {/* Navigation Controls */}
          {onPrev && (
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer shadow-lg hover:border-accent"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          )}

          {onNext && (
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer shadow-lg hover:border-accent"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Play Button Container */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <button
              onClick={handleStartTrailer}
              className="pointer-events-auto flex flex-col items-center justify-center gap-3 text-white/90 hover:text-white cursor-pointer group/play transition-transform active:scale-95"
              title="Play Official Trailer"
            >
              <div className="w-16 h-16 rounded-full bg-accent/90 hover:bg-accent flex items-center justify-center transition-all shadow-[0_0_30px_rgba(229,9,20,0.3)] hover:shadow-[0_0_40px_rgba(229,9,20,0.5)] border border-white/10">
                <Play className="w-6 h-6 fill-current ml-1" />
              </div>
              <span className="font-display font-bold text-xs uppercase tracking-wider text-white">
                Watch Trailer
              </span>
            </button>
          </div>

          {/* Bottom Title & Metadata Overlay */}
          {showMeta && (
            <div
              key={`meta-${activeMovie?.id}`}
              className={`absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-8 sm:right-8 md:left-10 md:right-10 text-left z-20 pointer-events-none max-w-2xl transition-all duration-500 ease-out ${
                isCrossfading ? 'opacity-30 translate-y-2' : 'opacity-100 translate-y-0'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-sm bg-accent text-white text-[10px] font-mono font-bold uppercase tracking-wide">
                  {activeMovie?.media_type === 'tv' || activeMovie?.first_air_date ? 'Series' : 'Feature Film'}
                </span>
                {year && (
                  <span className="font-mono text-xs text-text-secondary">
                    {year}
                  </span>
                )}
                {rating && (
                  <span className="font-mono text-xs text-gold font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {rating}
                  </span>
                )}
              </div>

              <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-5xl text-white tracking-tight leading-tight line-clamp-2 drop-shadow-md">
                {displayTitle}
              </h2>

              {activeMovie?.overview && (
                <p className="text-sm text-text-secondary font-sans mt-2 line-clamp-2 leading-relaxed max-w-xl hidden sm:block drop-shadow-sm">
                  {activeMovie.overview}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
