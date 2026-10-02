import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, LogOut, Home, User, Compass, X, Film,
  Flame, Calendar, MessageSquare, Bookmark, ArrowRight,
  Sparkles, TrendingUp, Tv
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL, getPosterUrl } from '../config';
import Avatar from './Avatar';
import Logo from './Logo';
import RatingBadge from './RatingBadge';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [liveResults, setLiveResults] = useState([]);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const searchInputRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);

  // Hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 15);
      setVisible(y <= lastScrollY.current || y < 120);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isMenuOpen]);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setLiveResults([]);
    }
  }, [isSearchOpen]);

  // Live search debounce
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
        console.error('Search error:', err);
      } finally {
        setIsLiveLoading(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const closeAll = () => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname.startsWith('/explore');
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { path: '/', label: 'Discover', icon: Flame },
    { path: '/schedule', label: 'Schedule', icon: Calendar },
    { path: '/spaces', label: 'Spaces', icon: MessageSquare },
    { path: '/collections', label: 'Collections', icon: Bookmark },
  ];

  return (
    <>
      {/* ─── Desktop Header ─── */}
      <header
        className={`sticky z-50 transition-all duration-200 py-3 px-4 sm:px-6 md:px-8 ${
          visible ? 'top-0' : '-top-20'
        } ${
          scrolled
            ? 'bg-bg-primary/90 backdrop-blur-xl border-b border-border shadow-lg'
            : 'bg-transparent border-b border-transparent'
        }`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 w-full">
          {/* Logo */}
          <div className="shrink-0">
            <Logo size="sm" onClick={closeAll} />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95 ${
                  isActive(path)
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Right: Search + Auth */}
          <div className="flex items-center gap-2">
            {/* Desktop search trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-surface border border-border text-text-muted hover:text-text-primary hover:border-border-hover text-xs transition-all duration-200 active:scale-95 cursor-pointer"
              aria-label="Search films"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden lg:inline text-[9px] font-mono px-1.5 py-0.5 rounded bg-bg-primary text-text-faint border border-border">
                ⌘K
              </kbd>
            </button>

            {/* Auth */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center rounded-full border-2 border-border hover:border-border-active transition-all duration-200 active:scale-95 cursor-pointer overflow-hidden"
                  aria-expanded={isMenuOpen}
                  aria-label="User menu"
                >
                  <Avatar username={user.username} url={user.avatar_url} className="w-8 h-8" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-bg-elevated border border-border rounded-xl shadow-2xl py-1.5 animate-fade-up z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-[10px] font-mono text-text-muted">Signed in as</p>
                      <p className="text-sm font-display font-bold text-text-primary truncate mt-0.5">@{user.username}</p>
                    </div>

                    <Link
                      to={`/profile/${user.username}`}
                      onClick={closeAll}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors"
                    >
                      <User className="w-4 h-4 text-warm" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      to="/collections?tab=my"
                      onClick={closeAll}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-warm" />
                      <span>My Collections</span>
                    </Link>

                    <Link
                      to="/collections?tab=watch-later"
                      onClick={closeAll}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors"
                    >
                      <Film className="w-4 h-4 text-accent" />
                      <span>Watchlist</span>
                    </Link>

                    <div className="my-1 border-t border-border" />

                    <button
                      onClick={() => { logout(); closeAll(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="px-3 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-primary py-2 px-4 text-xs font-medium rounded-lg">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Mobile Bottom Navigation ─── */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-bg-primary/95 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom)]"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around h-[68px] px-1">
          <Link
            to="/"
            onClick={closeAll}
            className={`flex-1 flex flex-col items-center justify-center h-full rounded-xl transition-all duration-200 active:scale-95 ${
              isActive('/') ? 'text-accent' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Flame className="w-[22px] h-[22px]" />
            <span className="text-[10px] font-medium mt-1">Discover</span>
          </Link>

          <button
            onClick={() => {
              setIsSearchOpen(true);
              setIsMenuOpen(false);
            }}
            className={`flex-1 flex flex-col items-center justify-center h-full rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
              isSearchOpen ? 'text-accent' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Search className="w-[22px] h-[22px]" />
            <span className="text-[10px] font-medium mt-1">Search</span>
          </button>

          <Link
            to="/schedule"
            onClick={closeAll}
            className={`flex-1 flex flex-col items-center justify-center h-full rounded-xl transition-all duration-200 active:scale-95 ${
              isActive('/schedule') ? 'text-accent' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Calendar className="w-[22px] h-[22px]" />
            <span className="text-[10px] font-medium mt-1">Schedule</span>
          </Link>

          <Link
            to="/collections"
            onClick={closeAll}
            className={`flex-1 flex flex-col items-center justify-center h-full rounded-xl transition-all duration-200 active:scale-95 ${
              isActive('/collections') ? 'text-accent' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Bookmark className="w-[22px] h-[22px]" />
            <span className="text-[10px] font-medium mt-1">Collections</span>
          </Link>

          <Link
            to={user ? `/profile/${user.username}` : '/login'}
            onClick={closeAll}
            className={`flex-1 flex flex-col items-center justify-center h-full rounded-xl transition-all duration-200 active:scale-95 ${
              location.pathname.startsWith('/profile') ? 'text-accent' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <User className="w-[22px] h-[22px]" />
            <span className="text-[10px] font-medium mt-1">{user ? 'Profile' : 'Sign In'}</span>
          </Link>
        </div>
      </nav>

      {/* ─── Search Modal ─── */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-12 sm:pt-20 px-4 bg-black/80 backdrop-blur-lg animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSearchOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Search films"
        >
          <div className="w-full max-w-xl bg-bg-elevated border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-up">
            {/* Search input */}
            <form onSubmit={handleSearchSubmit} className="relative p-4 border-b border-border flex items-center gap-3">
              <Search className="w-5 h-5 text-accent shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search films, series, people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-text-primary placeholder-text-muted text-sm outline-none"
                aria-label="Search query"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-bg-surface transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button type="button" onClick={() => setIsSearchOpen(false)} className="text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-bg-surface transition-colors shrink-0">
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-surface text-text-faint border border-border">ESC</kbd>
              </button>
            </form>

            {/* Results */}
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
              {/* Quick tags when empty */}
              {!searchQuery.trim() && (
                <div className="space-y-3">
                  <p className="text-[10px] font-mono font-semibold uppercase text-text-muted flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3" />
                    Popular
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Dune', 'Oppenheimer', 'Interstellar', 'Severance', 'Christopher Nolan', 'Denis Villeneuve'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => { setSearchQuery(tag); }}
                        className="px-3 py-1.5 rounded-lg bg-bg-surface hover:bg-bg-hover border border-border text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading */}
              {isLiveLoading && (
                <div className="py-6 text-center">
                  <div className="w-5 h-5 mx-auto rounded-full border-2 border-border border-t-accent animate-spin" />
                </div>
              )}

              {/* No results */}
              {!isLiveLoading && searchQuery.trim() && liveResults.length === 0 && (
                <div className="py-8 text-center space-y-2">
                  <p className="text-sm font-medium text-text-secondary">No results for "{searchQuery}"</p>
                  <p className="text-xs text-text-muted">Press Enter for a full search</p>
                </div>
              )}

              {/* Results list */}
              {!isLiveLoading && liveResults.length > 0 && (
                <div className="space-y-1">
                  {liveResults.map((item) => (
                    item.media_type === 'user' ? (
                      <Link
                        key={`user-${item.id}`}
                        to={`/profile/${item.username}`}
                        onClick={closeAll}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-bg-surface transition-colors"
                      >
                        <Avatar username={item.username} url={item.avatar_url} className="w-9 h-9" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-text-primary truncate">@{item.username}</p>
                          <p className="text-[10px] font-mono text-text-muted">User</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-text-faint" />
                      </Link>
                    ) : (
                      <Link
                        key={`movie-${item.id}`}
                        to={`/media/${item.media_type || 'movie'}/${item.id}`}
                        onClick={closeAll}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-bg-surface transition-colors"
                      >
                        <div className="w-9 h-13 rounded-md overflow-hidden bg-bg-primary shrink-0 border border-border">
                          {item.poster_path && (
                            <img src={getPosterUrl(item.poster_path, 'w92')} alt={item.title || item.name} className="w-full h-full object-cover" loading="lazy" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-text-primary truncate">{item.title || item.name}</p>
                          <p className="text-[10px] font-mono text-text-muted">
                            {item.media_type === 'tv' ? 'Series' : 'Film'}
                            {(item.release_date || item.first_air_date) && ` · ${(item.release_date || item.first_air_date).substring(0, 4)}`}
                          </p>
                        </div>
                        {item.vote_average > 0 && (
                          <RatingBadge rating={Math.round(item.vote_average / 2)} size="xs" />
                        )}
                      </Link>
                    )
                  ))}

                  <button
                    onClick={handleSearchSubmit}
                    className="w-full py-2.5 mt-2 rounded-xl bg-accent/10 hover:bg-accent/15 border border-accent/20 text-xs font-medium text-text-primary flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>View all results for "{searchQuery}"</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
