import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Flame, Trophy, Film, Tv, ArrowRight, Star, Clock, Ticket, Copy, Check, ExternalLink,
  Sparkles, TrendingUp, Compass, Bookmark, ShoppingBag, MessageSquare, ChevronRight, Play
} from 'lucide-react';
import { API_URL, getPosterUrl, getBackdropUrl } from '../config';
import { useToast } from '../context/ToastContext';
import MovieCard from '../components/MovieCard';
import RatingBadge from '../components/RatingBadge';
import Avatar from '../components/Avatar';
import TrailerHero from '../components/TrailerHero';
import MovieStack from '../components/MovieStack';
import GlassSurface from '../components/GlassSurface';

export default function Home({ onOpenPerson }) {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('filter') || 'trending';

  const { data: homeBundle, isLoading: bundleLoading } = useQuery({
    queryKey: ['homeBundle'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/home/bundle`);
      if (!res.ok) throw new Error('Failed to fetch home bundle');
      return res.json();
    }
  });

  const { data: exploreBundle } = useQuery({
    queryKey: ['exploreBundle'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/explore/bundle`);
      if (!res.ok) return { anime: [], noir: [], nowPlaying: [] };
      return res.json();
    }
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
  const [isHovered, setIsHovered] = useState(false);
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
    if (featuredList.length <= 1 || isTrailerActive || isHovered) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % featuredList.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [featuredList.length, isTrailerActive, heroIndex, isHovered]);

  const handlePrevSlide = () => {
    if (featuredList.length <= 1) return;
    setHeroIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length);
  };

  const handleNextSlide = () => {
    if (featuredList.length <= 1) return;
    setHeroIndex((prev) => (prev + 1) % featuredList.length);
  };

  // Most Interested Leaderboard with verified real TMDB assets
  const mostInterestedData = {
    week: [
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
    <div className="flex-1 pb-24 font-sans text-slate-100 relative overflow-hidden">

      {/* Hero Showcase / Talk of the Town Carousel */}
      <div 
        className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-4 sm:pt-6 pb-6 relative z-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {heroMovie ? (
          <div className="space-y-3.5">
            <TrailerHero
              movie={heroMovie}
              mediaType={heroMovie.name ? 'tv' : 'movie'}
              onPrev={featuredList.length > 1 ? handlePrevSlide : null}
              onNext={featuredList.length > 1 ? handleNextSlide : null}
              onTrailerStateChange={(active) => setIsTrailerActive(active)}
            />

            {/* Symmetrical Dot Indicators with Red-Orange Glow */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {featuredList.map((movieItem, idx) => (
                <button
                  key={`dot-${movieItem.id || idx}`}
                  onClick={() => setHeroIndex(idx)}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className={`relative h-2.5 rounded-full transition-all duration-500 cursor-pointer overflow-hidden ${
                    heroIndex === idx
                      ? 'w-10 bg-gradient-to-r from-[#e50914] via-[#ff6b00] to-[#ffa033] shadow-[0_0_12px_rgba(255,107,0,0.6)]'
                      : 'w-3 bg-white/30 hover:bg-white/60'
                  }`}
                  title={`Go to ${movieItem.title || movieItem.name || `slide ${idx + 1}`}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="aspect-[21/9] w-full rounded-3xl bg-white/5 border border-white/8 skeleton-shimmer" />
        )}
      </div>

      {/* Main 2-Column Responsive Layout (Explore Stream + Sticky Right Rail) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_350px] gap-8 relative z-10 items-start">
        
        {/* Left / Main Column (Talk of the Town, OTT Feeds, Partner Perks) */}
        <div className="space-y-12 min-w-0">

          {/* Talk of the Town Filter Bar */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/8 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#e50914] to-[#ff6b00] shadow-[0_0_10px_#ff6b00]" />
                <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2">
                  <span>Talk of the Town</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#ff6b00]/15 text-[#ffa033] border border-[#ff6b00]/30 font-bold">
                    Live
                  </span>
                </h2>
              </div>

              {/* Sub-Category Rail */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                {[
                  { id: 'trending', label: 'Trending', icon: Flame },
                  { id: 'nowPlaying', label: 'In Theatres', icon: Film },
                  { id: 'topRated', label: 'Hall of Fame', icon: Trophy },
                  { id: 'anime', label: 'Anime Vault', icon: Sparkles },
                  { id: 'noir', label: 'Neo-Noir', icon: Compass },
                  { id: 'tv', label: 'Series', icon: Tv }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      selectedCategory === cat.id
                        ? 'bg-gradient-to-r from-[#e50914] to-[#ff6b00] text-white shadow-[0_0_12px_rgba(255,107,0,0.35)]'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/8'
                    }`}
                  >
                    <cat.icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Movie Grid */}
            {bundleLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[2/3] rounded-2xl bg-white/5 border border-white/8 skeleton-shimmer" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
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
                  <MovieCard key={`${movie.media_type || 'm'}-${movie.id}`} movie={movie} />
                ))}
              </div>
            )}
          </div>

                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffa033] shadow-[0_0_8px_#ffa033]" />
                  <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight">
                    Editor's Pick of the Week
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#ffa033]">Certified Masterwork</span>
              </div>

              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#101015] p-5 sm:p-7 flex flex-col md:flex-row gap-6 items-center">
                {/* Backdrop ambient */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-15 blur-sm pointer-events-none"
                  style={{ backgroundImage: `url(${getBackdropUrl(editorPick.backdrop_path)})` }}
                />

                <div className="w-36 sm:w-44 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden border border-white/15 shadow-2xl relative z-10">
                  <img
                    src={getPosterUrl(editorPick.poster_path)}
                    alt={editorPick.title || editorPick.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-3 relative z-10 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <RatingBadge rating={5} size="sm" />
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(editorPick.release_date || editorPick.first_air_date || Date.now()).getFullYear()}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/6 text-[10px] font-mono text-slate-300">
                      Editor's Choice
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                    {editorPick.title || editorPick.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed line-clamp-3">
                    {editorPick.overview || 'A staggering tour de force in modern cinema. Visually unyielding and narratively peerless.'}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Link
                      to={`/media/${editorPick.name ? 'tv' : 'movie'}/${editorPick.id}`}
                      className="btn-fire py-2 px-4 rounded-xl text-xs font-display font-bold uppercase tracking-wider"
                    >
                      Explore Dossier & Reviews
                    </Link>
                    <Link
                      to="/spaces"
                      className="btn-secondary py-2 px-4 rounded-xl text-xs font-display font-bold uppercase tracking-wider"
                    >
                      Discuss in Spaces
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Streaming Platforms Carousels */}
          {/* Netflix */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e50914] shadow-[0_0_8px_#e50914]" />
                <h3 className="font-display font-black text-lg sm:text-xl text-white tracking-tight">
                  Streaming on Netflix
                </h3>
              </div>
              <Link to="/search?q=Netflix" className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1">
                <span>View Row</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#e50914]" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
              {netflixPicks.map(movie => (
                <MovieCard key={`netflix-${movie.id}`} movie={movie} />
              ))}
            </div>
          </section>

          {/* Prime Video */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00a8e1] shadow-[0_0_8px_#00a8e1]" />
                <h3 className="font-display font-black text-lg sm:text-xl text-white tracking-tight">
                  Worth Watching on Prime Video
                </h3>
              </div>
              <Link to="/search?q=Prime" className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1">
                <span>View Row</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#00a8e1]" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
              {primePicks.map(movie => (
                <MovieCard key={`prime-${movie.id}`} movie={movie} />
              ))}
            </div>
          </section>

          {/* JioHotstar */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffa033] shadow-[0_0_8px_#ffa033]" />
                <h3 className="font-display font-black text-lg sm:text-xl text-white tracking-tight">
                  Popular on JioHotstar
                </h3>
              </div>
              <Link to="/search?q=JioHotstar" className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1">
                <span>View Row</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#ffa033]" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
              {jioHotstarPicks.map(movie => (
                <MovieCard key={`jio-${movie.id}`} movie={movie} />
              ))}
            </div>
          </section>

          {/* Anime & Animation Vault */}
          {animeMovies.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/8 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b47] shadow-[0_0_8px_#ff3b47]" />
                  <h3 className="font-display font-black text-lg sm:text-xl text-white tracking-tight flex items-center gap-2">
                    <span>Anime & Animation Masterpieces</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ff3b47]/15 text-[#ff4d5a] border border-[#ff3b47]/30 uppercase font-bold">
                      Ghibli & Cult
                    </span>
                  </h3>
                </div>
                <Link to="/search?q=Anime" className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1">
                  <span>Explore Vault</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#ff3b47]" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
                {animeMovies.slice(0, 6).map(movie => (
                  <MovieCard key={`anime-${movie.id}`} movie={movie} />
                ))}
              </div>
            </section>
          )}

          {/* Interactive Blind Pick Mystery Stack */}
          {popularMovies.length > 0 && (
            <section className="pt-2">
              <MovieStack movies={topRatedMovies.length > 0 ? topRatedMovies : popularMovies} />
            </section>
          )}

          {/* Member Reviews & Verdicts Feed */}
          {recentReviews.length > 0 && (
            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-white/8 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff6b00] shadow-[0_0_8px_#ff6b00]" />
                  <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight">
                    Fresh Cinephile Verdicts
                  </h2>
                </div>
                <Link to="/spaces" className="text-xs font-display font-bold text-[#ffa033] hover:text-white uppercase tracking-wider">
                  View Community Spaces →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentReviews.slice(0, 6).map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-[#101015] border border-white/8 p-4.5 rounded-2xl space-y-3.5 flex flex-col justify-between hover:border-[#ff6b00]/40 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar username={rev.username} url={rev.avatar_url} className="w-7 h-7 ring-1 ring-white/15" />
                          <Link to={`/profile/${rev.username}`} className="font-sans font-bold text-xs text-slate-200 hover:text-[#ffa033]">
                            @{rev.username}
                          </Link>
                        </div>
                        <RatingBadge rating={rev.rating} size="sm" />
                      </div>

                      <Link
                        to={`/media/${rev.media_type || 'movie'}/${rev.tmdb_movie_id}`}
                        className="font-display font-bold text-sm text-slate-100 hover:text-[#ffa033] transition-colors block line-clamp-1"
                      >
                        {rev.title || `Film #${rev.tmdb_movie_id}`}
                      </Link>

                      {rev.review_text && (
                        <p className="text-xs text-slate-300 italic line-clamp-3 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/6 font-sans">
                          "{rev.review_text}"
                        </p>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 block pt-1 border-t border-white/6">
                      Logged: {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Right Sticky Sidebar (Leaderboard, Spaces) */}
        <aside className="space-y-6 lg:sticky lg:top-20">



          {/* Most Interested Leaderboard (Moctale's Exact Feature) */}
          <div className="rounded-3xl p-5 border border-white/10 bg-[#101015] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#e50914]" />
                <h3 className="font-display font-bold text-sm text-white">
                  Most Interested
                </h3>
              </div>

              {/* Timeframe Select */}
              <div className="flex items-center gap-1 text-[10px] font-mono">
                {['week', 'month', 'all'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setLeaderboardTimeframe(t)}
                    className={`px-2 py-0.5 rounded-md capitalize transition-colors cursor-pointer ${
                      leaderboardTimeframe === t
                        ? 'bg-[#ff6b00] text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t === 'all' ? 'All' : t === 'month' ? 'Month' : 'Week'}
                  </button>
                ))}
              </div>
            </div>

            {/* Ranked List 1 to 5 */}
            <div className="space-y-3">
              {currentLeaderboard.map((item) => (
                <Link
                  key={item.id}
                  to={`/media/${item.type}/${item.id}`}
                  className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 transition-all group"
                >
                  <span className={`w-6 text-center font-display font-black text-sm shrink-0 ${
                    item.rank === 1 ? 'text-[#e50914]' : item.rank === 2 ? 'text-[#ff6b00]' : item.rank === 3 ? 'text-[#ffa033]' : 'text-slate-400'
                  }`}>
                    #{item.rank}
                  </span>

                  <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-black/40">
                    <img
                      src={getPosterUrl(item.poster, 'w185')}
                      alt={item.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=185&auto=format&fit=crop';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="font-display font-bold text-xs text-white truncate group-hover:text-[#ffa033] transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span className="text-amber-400">{item.venue}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-mono text-[#ff6b00]">
                      <Flame className="w-3 h-3" />
                      <span>{item.hype} interested</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Link
              to="/schedule"
              className="w-full block text-center text-xs font-display font-bold text-slate-400 hover:text-[#ffa033] pt-2 border-t border-white/6"
            >
              View Full Release Radar →
            </Link>
          </div>



          {/* Quick Jump to Spaces */}
          <div className="rounded-3xl p-5 border border-white/10 bg-[#101015] shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#ff6b00]" />
              <h4 className="font-display font-bold text-sm text-white">Cinephile Spaces</h4>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Join debates, drop honest film verdicts, and vote on community film meters with verified cinephiles.
            </p>
            <Link
              to="/spaces"
              className="btn-fire w-full py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider text-center block"
            >
              Enter Spaces Feed →
            </Link>
          </div>

        </aside>

      </div>
    </div>
  );
}
