import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, Users, FolderPlus, LogOut, Home, User, Compass, X, Film, Sparkles, TrendingUp, ArrowRight,
  Flame, Calendar, MessageSquare, Bookmark, LayoutGrid, Bell, ChevronDown, Check, ExternalLink, Ticket, Trophy,
  Star, Clapperboard, Tv, ShieldCheck, Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL, getPosterUrl, getAuthHeaders } from '../config';
import Avatar from './Avatar';
import Logo from './Logo';
import GlassSurface from './GlassSurface';
import GlassTabBar from './GlassTabBar';
import RatingBadge from './RatingBadge';

export default function Navbar() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);



  const [liveResults, setLiveResults] = useState([]);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const searchInputRef = useRef(null);
  const modalInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const modalInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 15);
      if (currentScrollY > lastScrollY.current && currentScrollY > 120) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Ctrl+K / Cmd+K search shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus search modal input when opened
  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => {
        modalInputRef.current?.focus();
      }, 100);
    } else {
      setLiveResults([]);
    }
  }, [isSearchModalOpen]);

  // Live search debounced fetch
  useEffect(() => {
    if (!searchQuery.trim()) {
      setLiveResults([]);
      setIsLiveLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLiveLoading(true);
      try {
        const res = await fetch(`${API_URL}/movies/search?query=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setLiveResults((data.results || []).slice(0, 6));
        }
      } catch (err) {
        console.error('Live search error:', err);
      } finally {
        setIsLiveLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
    setIsOpen(false);
    setIsSearchModalOpen(false);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    setIsSearchModalOpen(false);
  };

  const currentActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path.startsWith('/explore')) return '/explore';
    if (path.startsWith('/schedule')) return '/schedule';
    if (path.startsWith('/spaces')) return '/spaces';
    if (path.startsWith('/collections') || path.startsWith('/lists')) return '/collections';
    return '';
  };

  return (
    <>
      {/* Top Header - Red, Orange & Charcoal Glass Header */}
      <header
        className={`sticky z-50 transition-all duration-300 select-none py-2.5 sm:py-3 px-4 sm:px-6 md:px-10 ${
          visible ? 'top-0' : '-top-28'
        } ${
          scrolled
            ? 'bg-[#08080b]/85 backdrop-blur-2xl border-b border-white/8 shadow-[0_6px_35px_rgba(0,0,0,0.85)]'
            : 'bg-transparent border-b border-transparent shadow-none'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4 md:gap-6 w-full">
          {/* Left: Brand Logo */}
          <div className="flex items-center justify-start shrink-0">
            <Logo size="sm" onClick={handleLinkClick} />
          </div>

          {/* Center: Main Moctale-Style Tabs */}
          <div className="hidden lg:flex items-center justify-center">
            <GlassTabBar
              tabs={[
                { id: '/explore', label: 'Explore', icon: Flame },
                { id: '/schedule', label: 'Schedule', icon: Calendar },
                { id: '/spaces', label: 'Spaces', icon: MessageSquare },
                { id: '/collections', label: 'Collections', icon: Bookmark }
              ]}
              activeTab={currentActiveTab()}
              onTabChange={(tabId) => navigate(tabId)}
            />
          </div>



            {/* Universal Search Bar (Desktop & Tablet) */}
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search films, actors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchModalOpen(true)}
                className="w-32 sm:w-36 md:w-40 lg:w-48 xl:w-56 bg-white/6 hover:bg-white/10 focus:bg-black/90 text-white placeholder-slate-400 text-xs font-sans rounded-full pl-9 pr-8 py-2 border border-white/12 focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] transition-all outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <kbd className="hidden lg:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-400 border border-white/10 pointer-events-none">
                ⌘K
              </kbd>
            </form>

            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="sm:hidden p-2 rounded-xl bg-white/6 border border-white/10 text-slate-300 hover:text-white"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Auth Dropdown & User Avatar */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center rounded-full border border-white/20 hover:border-[#ff6b00] transition-all focus:outline-none cursor-pointer overflow-hidden p-0 shadow-md"
                >
                  <Avatar username={user.username} url={user.avatar_url} className="w-8 h-8 sm:w-8.5 sm:h-8.5" />
                </button>

                {isOpen && (
                  <div
                    className="absolute right-0 mt-3 w-56 bg-[#0e0e13]/95 backdrop-blur-2xl border border-white/12 rounded-3xl shadow-[0_16px_50px_rgba(0,0,0,0.95)] py-2 text-left z-50 animate-fade-up"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-white/8">
                      <p className="text-[11px] font-mono text-slate-400">Signed in as</p>
                      <p className="text-sm font-display font-bold text-white truncate mt-0.5">@{user.username}</p>
                    </div>

                    <Link
                      to={`/profile/${user.username}`}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-sans font-semibold text-slate-200 hover:text-white hover:bg-white/6 transition-colors"
                    >
                      <User className="w-4 h-4 text-[#ff6b00]" />
                      <span>Vault Profile</span>
                    </Link>

                    <Link
                      to="/collections?tab=my"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-sans font-semibold text-slate-200 hover:text-white hover:bg-white/6 transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-[#ff6b00]" />
                      <span>My Collections</span>
                    </Link>

                    <Link
                      to="/collections?tab=watch-later"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-sans font-semibold text-slate-200 hover:text-white hover:bg-white/6 transition-colors"
                    >
                      <Film className="w-4 h-4 text-[#e50914]" />
                      <span>Watch Later Queue</span>
                    </Link>

                    <div className="my-1 border-t border-white/8" />

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-sans font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn-fire py-2 px-4 rounded-xl text-xs font-display font-bold uppercase tracking-wider shadow-md whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Floating Bottom Dock (Moctale-inspired 5-tab glass dock) */}
      <div className="lg:hidden fixed bottom-3 inset-x-3 z-50 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={26}
          backgroundOpacity={0.4}
          blur={20}
          borderOpacity={0.16}
          className="glass-surface--dock shadow-[0_16px_50px_rgba(0,0,0,0.95),0_0_20px_rgba(255,107,0,0.15)] p-1"
        >
          <div className="flex items-center justify-around w-full py-1 px-1 gap-1">
            <Link
              to="/explore"
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all ${
                currentActiveTab() === '/explore'
                  ? 'bg-gradient-to-r from-[#e50914] to-[#ff6b00] text-white shadow-[0_0_14px_rgba(255,107,0,0.45)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/6'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span className="text-[9px] font-display font-bold uppercase tracking-wider mt-0.5">Explore</span>
            </Link>

            <Link
              to="/schedule"
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all ${
                currentActiveTab() === '/schedule'
                  ? 'bg-gradient-to-r from-[#e50914] to-[#ff6b00] text-white shadow-[0_0_14px_rgba(255,107,0,0.45)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/6'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="text-[9px] font-display font-bold uppercase tracking-wider mt-0.5">Schedule</span>
            </Link>

            <Link
              to="/spaces"
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all ${
                currentActiveTab() === '/spaces'
                  ? 'bg-gradient-to-r from-[#e50914] to-[#ff6b00] text-white shadow-[0_0_14px_rgba(255,107,0,0.45)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/6'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-[9px] font-display font-bold uppercase tracking-wider mt-0.5">Spaces</span>
            </Link>

            <Link
              to="/collections"
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all ${
                currentActiveTab() === '/collections'
                  ? 'bg-gradient-to-r from-[#e50914] to-[#ff6b00] text-white shadow-[0_0_14px_rgba(255,107,0,0.45)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/6'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span className="text-[9px] font-display font-bold uppercase tracking-wider mt-0.5">Lists</span>
            </Link>

            {user ? (
              <Link
                to={`/profile/${user.username}`}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all ${
                  location.pathname.startsWith(`/profile/${user.username}`)
                    ? 'bg-gradient-to-r from-[#e50914] to-[#ff6b00] text-white shadow-[0_0_14px_rgba(255,107,0,0.45)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/6'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="text-[9px] font-display font-bold uppercase tracking-wider mt-0.5">Profile</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl text-slate-300 hover:text-white hover:bg-white/6"
              >
                <User className="w-4 h-4" />
                <span className="text-[9px] font-display font-bold uppercase tracking-wider mt-0.5">Sign In</span>
              </Link>
            )}
          </div>
        </GlassSurface>
      </div>


      {/* Quick Search Overlay Modal (Universal & Mobile Responsive) */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-20 px-3 sm:px-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-[#0e0e12]/95 border border-white/12 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_40px_rgba(229,9,20,0.18)] overflow-hidden text-left"
            style={{ animation: 'fade-up 220ms cubic-bezier(0.16, 1, 0.3, 1) both' }}
          >
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="relative p-3.5 sm:p-4 border-b border-white/8 flex items-center gap-3">
              <Search className="w-5 h-5 text-[#e50914] shrink-0" />
              <input
                ref={modalInputRef}
                type="text"
                placeholder="Search films, series, directors, critics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchSubmit(e);
                  }
                }}
                className="w-full bg-transparent text-white placeholder-slate-400 font-sans text-sm sm:text-base outline-none pr-8"
              />
              <button type="submit" className="sr-only">Submit</button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </form>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto space-y-5 scrollbar-none">
              {/* Quick Trending Tags */}
              {!searchQuery.trim() && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase text-slate-400">
                    <TrendingUp className="w-3.5 h-3.5 text-[#ffb800]" />
                    <span>Popular Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Dune', 'Oppenheimer', 'Interstellar', 'Severance', 'Christopher Nolan', 'Denis Villeneuve', 'Pure Cinema'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleQuickTagClick(tag)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#e50914]/20 border border-white/8 hover:border-[#e50914]/40 text-xs font-sans text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3 h-3 text-[#e50914]" />
                        <span>{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Search Results */}
              {isLiveLoading && (
                <div className="p-6 text-center text-xs font-mono text-slate-400 animate-pulse">
                  SEARCHING VAULT ARCHIVES...
                </div>
              )}

              {!isLiveLoading && searchQuery.trim() && liveResults.length === 0 && (
                <div className="p-6 text-center text-xs font-mono text-slate-500">
                  No cinephile records found for "{searchQuery}"
                </div>
              )}

              {!isLiveLoading && liveResults.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block pb-1">
                    Instant Matches ({liveResults.length})
                  </span>
                  <div className="space-y-1.5">
                    {liveResults.map((item) => (
                      item.media_type === 'user' ? (
                        <Link
                          key={`user-${item.id}`}
                          to={`/profile/${item.username}`}
                          onClick={handleLinkClick}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/6 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar username={item.username} url={item.avatar_url} className="w-9 h-9" />
                            <div className="min-w-0">
                              <span className="font-display font-bold text-sm text-white block truncate">
                                @{item.username}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 truncate block">
                                Critic Profile
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-500" />
                        </Link>
                      ) : (
                        <Link
                          key={`movie-${item.id}`}
                          to={`/media/${item.media_type || 'movie'}/${item.id}`}
                          onClick={handleLinkClick}
                          className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/6 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-14 rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
                              <img
                                src={getPosterUrl(item.poster_path, 'w92')}
                                alt={item.title || item.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <p className="font-display font-bold text-sm text-white truncate">
                                {item.title || item.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-400 uppercase">
                                  {item.media_type === 'tv' ? 'Series' : 'Film'}
                                </span>
                                {(item.release_date || item.first_air_date) && (
                                  <span className="text-[10px] font-mono text-slate-500">
                                    {(item.release_date || item.first_air_date).substring(0, 4)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {item.vote_average > 0 && (
                            <RatingBadge rating={Math.round(item.vote_average / 2)} size="xs" />
                          )}
                        </Link>
                      )
                    ))}
                  </div>

                  <button
                    onClick={handleSearchSubmit}
                    className="w-full py-2.5 mt-2 rounded-xl bg-[#e50914]/20 hover:bg-[#e50914]/30 border border-[#e50914]/40 text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>View All Results for "{searchQuery}"</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {!isLiveLoading && searchQuery && liveResults.length === 0 && (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <p className="text-sm font-display font-bold text-slate-200">No instant preview found</p>
                  <p className="text-xs font-sans text-slate-400">Press Enter to perform a full database search for "{searchQuery}".</p>
                  <button
                    onClick={handleSearchSubmit}
                    className="btn-primary py-2 px-5 text-xs font-bold font-mono mt-2"
                  >
                    Run Full Search
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
