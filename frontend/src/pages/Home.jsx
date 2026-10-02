import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Flame, Trophy, Film, Tv, Sparkles, Compass, ChevronRight 
} from 'lucide-react';
import { movies as moviesApi } from '../services/api';
import { getPosterUrl, getBackdropUrl } from '../config';
import { useToast } from '../context/ToastContext';
import MovieCard from '../components/MovieCard';
import RatingBadge from '../components/RatingBadge';
import Avatar from '../components/Avatar';
import TrailerHero from '../components/TrailerHero';
import MovieStack from '../components/MovieStack';
import { MovieGridSkeleton, HeroSkeleton } from '../components/Skeleton';

export default function Home({ onOpenPerson }) {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('filter') || 'trending';

  const { data: homeBundle, isLoading: bundleLoading } = useQuery({
    queryKey: ['homeBundle'],
    queryFn: moviesApi.getHomeBundle
  });

  const { data: exploreBundle, isLoading: exploreLoading } = useQuery({
    queryKey: ['exploreBundle'],
    queryFn: moviesApi.getExploreBundle
  });

  const popularMovies = homeBundle?.popularMovies || [];
  const topRatedMovies = homeBundle?.topRatedMovies || [];
  const upcomingMovies = homeBundle?.upcomingMovies || [];
  const popularTv = homeBundle?.popularTv || [];
  const recentReviews = homeBundle?.recentReviews || [];

  const animeMovies = exploreBundle?.anime || [];
  const noirMovies = exploreBundle?.noir || [];
  const nowPlayingMovies = exploreBundle?.nowPlaying || [];

  const [heroIndex, setHeroIndex] = useState(0);
  const [isTrailerActive, setIsTrailerActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [leaderboardTimeframe, setLeaderboardTimeframe] = useState('week');

  // Sync category if URL search param changes
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      if (filterParam === 'theaters') setSelectedCategory('nowPlaying');
      else if (filterParam === 'top100') setSelectedCategory('topRated');
      else setSelectedCategory(filterParam);
    }
  }, [searchParams]);

  const featuredList = popularMovies.slice(0, 6);
  const heroMovie = featuredList[heroIndex] || featuredList[0];

  // Editor's Pick
  const editorPick = topRatedMovies[0] || popularMovies[1] || heroMovie;

  // Curated OTT Slices
  const netflixPicks = popularMovies.filter((_, i) => i % 2 === 0).slice(0, 6);
  const primePicks = topRatedMovies.slice(2, 8);
  const jioHotstarPicks = upcomingMovies.slice(0, 6);

  // Slideshow cycle
  useEffect(() => {
    if (featuredList.length <= 1 || isTrailerActive) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % featuredList.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [featuredList.length, isTrailerActive, heroIndex]);

  const handlePrevSlide = () => {
    if (featuredList.length <= 1) return;
    setHeroIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length);
  };

  const handleNextSlide = () => {
    if (featuredList.length <= 1) return;
    setHeroIndex((prev) => (prev + 1) % featuredList.length);
  };

  // Dynamically generate leaderboard data based on actual TMDB data and popularity
  const formatLeaderboard = (movies) => {
    return (movies || []).slice(0, 5).map((m, idx) => ({
      rank: idx + 1,
      title: m.title || m.name,
      type: m.name ? 'tv' : 'movie',
      venue: m.name ? 'Series' : 'Feature Film',
      date: (m.release_date || m.first_air_date || '').split('-')[0] || 'TBA',
      hype: m.popularity ? (m.popularity > 1000 ? (m.popularity / 1000).toFixed(1) + 'k' : Math.round(m.popularity).toString()) : '-',
      poster: m.poster_path,
      id: m.id
    }));
  };

  const mostInterestedData = {
    week: formatLeaderboard(nowPlayingMovies.length > 0 ? nowPlayingMovies : popularMovies),
    month: formatLeaderboard(popularMovies),
    all: formatLeaderboard(topRatedMovies)
  };

  const currentLeaderboard = mostInterestedData[leaderboardTimeframe] || mostInterestedData.week;

  return (
    <div className="flex-1 pb-24 relative overflow-hidden">

      {/* Hero Showcase / Talk of the Town Carousel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-6">
        {bundleLoading ? (
          <HeroSkeleton />
        ) : heroMovie ? (
          <div className="space-y-3">
            <TrailerHero
              movie={heroMovie}
              mediaType={heroMovie.name ? 'tv' : 'movie'}
              onPrev={featuredList.length > 1 ? handlePrevSlide : null}
              onNext={featuredList.length > 1 ? handleNextSlide : null}
              onTrailerStateChange={(active) => setIsTrailerActive(active)}
            />

            {/* Symmetrical Dot Indicators */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {featuredList.map((movieItem, idx) => (
                <button
                  key={`dot-${movieItem.id || idx}`}
                  onClick={() => setHeroIndex(idx)}
                  className={`relative h-2 rounded-full transition-all duration-300 cursor-pointer overflow-hidden ${
                    heroIndex === idx
                      ? 'w-8 bg-accent'
                      : 'w-2 bg-text-faint hover:bg-text-muted'
                  }`}
                  title={`Go to ${movieItem.title || movieItem.name || `slide ${idx + 1}`}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Main 2-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 items-start">
        
        {/* Left / Main Column */}
        <div className="space-y-12 min-w-0">

          {/* Talk of the Town Filter Bar */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
              <div className="space-y-1">
                <h2 className="font-display font-bold text-2xl text-text-primary flex items-center gap-2">
                  Now Trending
                </h2>
                <p className="text-sm text-text-muted">The most discussed films and series right now.</p>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory overscroll-x-contain">
                {[
                  { id: 'trending', label: 'Trending', icon: Flame },
                  { id: 'nowPlaying', label: 'In Theatres', icon: Film },
                  { id: 'topRated', label: 'Hall of Fame', icon: Trophy },
                  { id: 'anime', label: 'Anime', icon: Sparkles },
                  { id: 'tv', label: 'Series', icon: Tv }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 sm:px-3 sm:py-1.5 rounded-full sm:rounded-lg text-[13px] sm:text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 snap-start ${
                      selectedCategory === cat.id
                        ? 'bg-text-primary text-bg-primary'
                        : 'bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-border'
                    }`}
                  >
                    <cat.icon className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Movie Grid / Mobile Rail */}
            {bundleLoading || (exploreLoading && ['anime', 'noir', 'nowPlaying'].includes(selectedCategory)) ? (
              <MovieGridSkeleton count={8} />
            ) : (
              <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-none overscroll-x-contain -mx-4 px-4 sm:mx-0 sm:px-0">
                {(selectedCategory === 'trending'
                  ? popularMovies.slice(0, 8)
                  : selectedCategory === 'nowPlaying'
                  ? (nowPlayingMovies.length > 0 ? nowPlayingMovies : upcomingMovies).slice(0, 8)
                  : selectedCategory === 'topRated'
                  ? topRatedMovies.slice(0, 8)
                  : selectedCategory === 'anime'
                  ? (animeMovies.length > 0 ? animeMovies : popularMovies).slice(0, 8)
                  : selectedCategory === 'noir'
                  ? (noirMovies.length > 0 ? noirMovies : topRatedMovies).slice(0, 8)
                  : popularTv.slice(0, 8)
                ).map((movie) => (
                  <div key={`${movie.media_type || 'm'}-${movie.id}`} className="w-[42vw] min-w-[140px] max-w-[180px] sm:w-auto sm:min-w-0 sm:max-w-none shrink-0 snap-start">
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Editor's Pick */}
          {editorPick && !bundleLoading && (
            <section className="space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="font-display font-bold text-xl text-text-primary">
                  Editor's Choice
                </h2>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-border bg-bg-elevated p-5 sm:p-6 md:p-8 flex flex-col md:flex-row gap-6 lg:gap-8 items-center">
                {/* Backdrop ambient */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-10 blur-xl pointer-events-none"
                  style={{ backgroundImage: `url(${getBackdropUrl(editorPick.backdrop_path)})` }}
                  aria-hidden="true"
                />

                <div className="w-40 sm:w-48 shrink-0 aspect-[2/3] rounded-xl overflow-hidden border border-border shadow-lg relative z-10">
                  <img
                    src={getPosterUrl(editorPick.poster_path)}
                    alt={editorPick.title || editorPick.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="space-y-4 relative z-10 flex-1 min-w-0 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <RatingBadge rating={5} size="sm" />
                    <span className="text-xs font-mono text-text-muted">
                      {new Date(editorPick.release_date || editorPick.first_air_date || Date.now()).getFullYear()}
                    </span>
                    <span className="px-2 py-0.5 rounded-sm bg-accent/10 text-accent text-[10px] font-mono font-bold uppercase">
                      Curated
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-text-primary tracking-tight">
                    {editorPick.title || editorPick.name}
                  </h3>

                  <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 max-w-2xl">
                    {editorPick.overview || 'A staggering tour de force in modern cinema. Visually unyielding and narratively peerless.'}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <Link
                      to={`/media/${editorPick.name ? 'tv' : 'movie'}/${editorPick.id}`}
                      className="btn-primary py-2.5 px-6"
                    >
                      Read Dossier
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Interactive Blind Pick Mystery Stack */}
          {!bundleLoading && popularMovies.length > 0 && (
            <section className="pt-4 hidden sm:block">
              <MovieStack movies={topRatedMovies.length > 0 ? topRatedMovies : popularMovies} />
            </section>
          )}

        </div>

        {/* Right Sticky Sidebar (Leaderboard) */}
        <aside className="space-y-6 xl:sticky xl:top-24">
          <div className="rounded-2xl p-5 border border-border bg-bg-elevated space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-bold text-sm text-text-primary">
                Leaderboard
              </h3>

              {/* Timeframe Select */}
              <div className="flex items-center gap-1 bg-bg-surface p-1 rounded-lg border border-border">
                {['week', 'month', 'all'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setLeaderboardTimeframe(t)}
                    className={`px-2 py-1 rounded-md text-[10px] font-mono uppercase transition-colors cursor-pointer ${
                      leaderboardTimeframe === t
                        ? 'bg-text-primary text-bg-primary font-bold'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {t === 'all' ? 'All' : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Ranked List 1 to 5 */}
            {bundleLoading ? (
              <div className="space-y-4 py-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="w-6 h-6 skeleton-shimmer rounded-full" />
                    <div className="w-10 h-14 skeleton-shimmer rounded-md" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 skeleton-shimmer rounded" />
                      <div className="h-2 w-1/2 skeleton-shimmer rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {currentLeaderboard.map((item) => (
                  <Link
                    key={item.id}
                    to={`/media/${item.type}/${item.id}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-bg-hover transition-colors group"
                  >
                    <span className={`w-5 text-center font-display font-bold text-sm shrink-0 ${
                      item.rank === 1 ? 'text-gold' : item.rank === 2 ? 'text-slate-300' : item.rank === 3 ? 'text-amber-700' : 'text-text-muted'
                    }`}>
                      {item.rank}
                    </span>

                    <div className="w-10 h-14 rounded-md overflow-hidden shrink-0 border border-border bg-bg-surface">
                      <img
                        src={getPosterUrl(item.poster, 'w92')}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-display font-bold text-xs text-text-primary truncate group-hover:text-accent transition-colors">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted">
                        <span>{item.venue}</span>
                        <span>·</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <Link
              to="/schedule"
              className="w-full block text-center text-xs font-medium text-text-secondary hover:text-text-primary pt-3 border-t border-border transition-colors"
            >
              View Full Release Radar →
            </Link>
          </div>
        </aside>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-16 space-y-12 pb-12">
        {/* Member Reviews Feed */}
        {!bundleLoading && recentReviews.length > 0 && (
          <section className="space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="font-display font-bold text-xl text-text-primary">
                Recent Reviews
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentReviews.slice(0, 6).map((rev) => (
                <div
                  key={rev.id}
                  className="bg-bg-elevated border border-border p-5 rounded-2xl space-y-4 flex flex-col justify-between hover:border-border-hover transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar username={rev.username} url={rev.avatar_url} className="w-8 h-8" />
                        <Link to={`/profile/${rev.username}`} className="font-medium text-sm text-text-primary hover:text-accent transition-colors truncate">
                          @{rev.username}
                        </Link>
                      </div>
                      <RatingBadge rating={rev.rating} size="sm" />
                    </div>

                    <div>
                      <Link
                        to={`/media/${rev.media_type || 'movie'}/${rev.tmdb_movie_id}`}
                        className="font-display font-bold text-base text-text-primary hover:text-accent transition-colors block line-clamp-1 mb-2"
                      >
                        {rev.title || `Film #${rev.tmdb_movie_id}`}
                      </Link>
                      {rev.review_text && (
                        <p className="text-sm text-text-secondary line-clamp-4 leading-relaxed font-sans">
                          "{rev.review_text}"
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-xs text-text-muted block pt-4 border-t border-border">
                    {new Date(rev.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
