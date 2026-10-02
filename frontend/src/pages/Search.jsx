import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, AlertCircle, Film, Users, Layers, Sparkles, TrendingUp, X } from 'lucide-react';
import { API_URL } from '../config';
import MovieCard from '../components/MovieCard';
import Avatar from '../components/Avatar';

// Note: Replaced GlassTabBar with a simple tab bar component
function SimpleTabBar({ tabs, activeTab, onTabChange, className = '' }) {
  return (
    <div className={`flex items-center gap-1 p-1 bg-bg-surface border border-border rounded-xl ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              isActive 
                ? 'bg-bg-elevated text-text-primary shadow-sm' 
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${isActive ? 'bg-accent/10 text-accent' : 'bg-bg-elevated text-text-muted'}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function UserCard({ user }) {
  return (
    <div className="p-5 flex flex-col items-center justify-between text-center rounded-2xl bg-bg-surface border border-border hover:border-border-hover transition-colors aspect-[2/3]">
      <div className="flex flex-col items-center w-full min-w-0">
        <span className="bg-accent/10 text-accent font-mono text-[10px] font-semibold px-2.5 py-0.5 border border-accent/20 rounded-full mb-3 uppercase shadow-sm">
          Critic
        </span>
        
        <Avatar username={user.username} url={user.avatar_url} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-border mb-2.5 shadow-sm" />
        
        <span className="font-sans font-bold text-text-primary text-xs sm:text-sm truncate w-full block">
          @{user.username}
        </span>
        
        <p className="text-[10px] sm:text-[11px] text-text-secondary mt-1.5 font-sans line-clamp-3 leading-relaxed">
          {user.bio || "Cinephile with no bio details yet."}
        </p>
      </div>

      <Link
        to={`/profile/${user.username}`}
        className="btn-secondary text-[11px] font-bold py-1.5 px-4 rounded-xl w-full text-center uppercase tracking-wider block mt-3"
      >
        View Profile
      </Link>
    </div>
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
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <SearchIcon className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-text-primary tracking-tight">
              Search Vault {queryStr ? <>: <span className="text-accent">"{queryStr}"</span></> : ''}
            </h1>
            <p className="text-xs font-mono text-text-secondary mt-0.5">
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
            className="w-full bg-bg-surface border border-border hover:border-border-hover focus:border-accent focus:ring-1 focus:ring-accent rounded-full py-3.5 pl-12 pr-28 text-sm font-sans text-text-primary placeholder-text-muted outline-none transition-all shadow-sm"
          />
          <SearchIcon className="w-4 h-4 text-text-muted absolute left-4 pointer-events-none" />
          {inputVal && (
            <button
              type="button"
              onClick={() => setInputVal('')}
              className="absolute right-24 text-text-muted hover:text-text-primary p-1 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="btn-primary absolute right-1.5 py-2 px-5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Quick Trending Suggestions */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[10px] font-mono font-bold uppercase text-text-muted flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-gold" />
            Trending:
          </span>
          {['Dune', 'Oppenheimer', 'Interstellar', 'Severance', 'Christopher Nolan', 'Denis Villeneuve', 'Pure Cinema'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="px-3 py-1 rounded-full bg-bg-surface hover:bg-bg-hover border border-border text-[11px] font-sans text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
      {queryStr && (
        <SimpleTabBar
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
        <div className="bg-bg-elevated border border-border p-8 sm:p-12 text-center text-text-secondary rounded-2xl space-y-3">
          <Sparkles className="w-8 h-8 text-accent mx-auto" />
          <p className="text-base font-display font-bold text-text-primary">Start exploring the PlotHole Vault</p>
          <p className="text-xs sm:text-sm font-sans max-w-md mx-auto">
            Type any film title, television series, actor, or critic handle above to search through thousands of cinematic records.
          </p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4 md:gap-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl bg-bg-surface border border-border skeleton-shimmer" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-error/10 border border-error/30 text-error rounded-2xl flex items-start gap-4">
          <AlertCircle className="w-8 h-8 shrink-0" />
          <div>
            <h3 className="font-display font-bold text-lg uppercase tracking-wider">SEARCH PROTOCOL ERROR</h3>
            <p className="text-xs mt-1 font-mono">{error.message}</p>
          </div>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="bg-bg-elevated border border-border p-8 sm:p-12 text-center text-text-secondary rounded-2xl space-y-2">
          <p className="text-base font-display font-bold text-text-primary">No results found for "{queryStr}".</p>
          <p className="text-xs font-sans">Check spelling or search for alternative film titles, web series, or member handles.</p>
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
