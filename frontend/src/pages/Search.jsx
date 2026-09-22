import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, AlertCircle, Film, Users, Layers, Sparkles, TrendingUp, X } from 'lucide-react';
import { API_URL } from '../config';
import MovieCard from '../components/MovieCard';
import Avatar from '../components/Avatar';
import GlassSurface from '../components/GlassSurface';
import GlassCard from '../components/GlassCard';

function UserCard({ user }) {
  return (
    <GlassCard className="p-5 flex flex-col items-center justify-between text-center rounded-3xl aspect-[2/3]">
      <div className="flex flex-col items-center w-full min-w-0">
        <span className="bg-[#e50914]/15 text-[#ff4d5a] font-mono text-[10px] font-semibold px-2.5 py-0.5 border border-[#e50914]/30 rounded-full mb-3 uppercase shadow-sm">
          Critic
        </span>
        
        <Avatar username={user.username} url={user.avatar_url} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-white/20 mb-2.5 shadow-md" />
        
        <span className="font-sans font-bold text-slate-100 text-xs sm:text-sm truncate w-full block">
          @{user.username}
        </span>
        
        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1.5 font-sans line-clamp-3 leading-relaxed">
          {user.bio || "Cinephile with no bio details yet."}
        </p>
      </div>

      <Link
        to={`/profile/${user.username}`}
        className="glass-btn-red text-[11px] font-display font-bold py-1.5 px-4 rounded-xl w-full text-center shadow-md uppercase tracking-wider block"
      >
        View Profile
      </Link>
    </GlassCard>
  );
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryStr = searchParams.get('q') || '';
  const [inputVal, setInputVal] = useState(queryStr);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    setInputVal(queryStr);
  }, [queryStr]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setSearchParams({ q: inputVal.trim() });
  };

  const handleTagClick = (tag) => {
    setInputVal(tag);
    setSearchParams({ q: tag });
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['searchMovies', queryStr],
    queryFn: async () => {
      if (!queryStr) return { results: [] };
      const res = await fetch(`${API_URL}/movies/search?query=${encodeURIComponent(queryStr)}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    enabled: !!queryStr
  });

  const movies = data?.results || [];

  const filteredResults = movies.filter((item) => {
    if (activeTab === 'movies') {
      return item.media_type !== 'user';
    }
    if (activeTab === 'users') {
      return item.media_type === 'user';
    }
    return true;
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-10 text-left font-sans space-y-6 md:space-y-8">
      {/* Search Header Banner */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 border-b border-white/8 pb-4">
          <SearchIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#e50914]" />
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-white tracking-tight">
              Search Vault {queryStr ? <>: <span className="text-[#ff4d5a]">"{queryStr}"</span></> : ''}
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              {queryStr ? `Found ${movies.length} cinephile records` : 'Explore global cinema, TV series, and critics'}
            </p>
          </div>
        </div>

        {/* Prominent Responsive On-Page Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full max-w-2xl">
          <input
            type="text"
            placeholder="Search films, series, directors, member handles..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full bg-[#121218]/90 border border-white/12 hover:border-white/25 focus:border-[#e50914] focus:ring-2 focus:ring-[#e50914]/30 rounded-full py-3.5 pl-12 pr-28 text-sm font-sans text-white placeholder-slate-400 outline-none transition-all shadow-lg backdrop-blur-xl"
          />
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-4.5 pointer-events-none" />
          {inputVal && (
            <button
              type="button"
              onClick={() => setInputVal('')}
              className="absolute right-24 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="glass-btn-red absolute right-1.5 py-2 px-5 rounded-full text-xs font-display font-bold uppercase tracking-wider cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Quick Trending Suggestions */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[#ffb800]" />
            Trending:
          </span>
          {['Dune', 'Oppenheimer', 'Interstellar', 'Severance', 'Christopher Nolan', 'Denis Villeneuve', 'Pure Cinema'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="px-3 py-1 rounded-full bg-white/6 hover:bg-[#e50914]/20 border border-white/10 hover:border-[#e50914]/40 text-[11px] font-sans text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* AICanvas Realistic Liquid Glass Tab Bar */}
      {queryStr && (
        <GlassTabBar
          tabs={[
            { id: 'all', label: 'All', icon: Layers, count: movies.length },
            { id: 'movies', label: 'Films & Series', icon: Film, count: movies.filter(m => m.media_type !== 'user').length },
            { id: 'users', label: 'Critics', icon: Users, count: movies.filter(m => m.media_type === 'user').length }
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="w-full sm:w-fit"
        />
      )}

      {!queryStr ? (
        <div className="glass-panel p-8 sm:p-12 text-center text-slate-400 rounded-3xl space-y-3">
          <Sparkles className="w-8 h-8 text-[#e50914] mx-auto" />
          <p className="text-base font-display font-bold text-slate-100">Start exploring the PlotHole Vault</p>
          <p className="text-xs sm:text-sm font-sans text-slate-400 max-w-md mx-auto">
            Type any film title, television series, actor, or critic handle above to search through thousands of cinematic records.
          </p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4 md:gap-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl bg-white/5 border border-white/8 skeleton-shimmer" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-3xl flex items-start gap-4">
          <AlertCircle className="w-8 h-8 shrink-0" />
          <div>
            <h3 className="font-display font-bold text-lg uppercase">SEARCH PROTOCOL ERROR</h3>
            <p className="text-xs mt-1 font-mono">{error.message}</p>
          </div>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="glass-panel p-8 sm:p-12 text-center text-slate-400 rounded-3xl space-y-2">
          <p className="text-base font-display font-bold text-slate-100">No results found for "{queryStr}".</p>
          <p className="text-xs font-sans text-slate-400">Check spelling or search for alternative film titles, web series, or member handles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4 md:gap-5">
          {filteredResults.map((item, idx) => (
            item.media_type === 'user' ? (
              <UserCard key={`user-${item.id || idx}`} user={item} />
            ) : (
              <MovieCard key={`movie-${item.id || idx}`} movie={item} />
            )
          ))}
        </div>
      )}
    </div>
  );
}

