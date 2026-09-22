import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ListPlus, Trash2, Film, Loader2, ArrowLeft, FolderPlus, Layers, Trophy, User, Sparkles, Flame, Bookmark } from 'lucide-react';
import { API_URL, getPosterUrl } from '../config';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';
import MovieCard from '../components/MovieCard';
import CreateListModal from '../components/CreateListModal';
import GlassSurface from '../components/GlassSurface';
import GlassTabBar from '../components/GlassTabBar';
import GlassCard from '../components/GlassCard';

export const CURATED_COLLECTIONS = [
  {
    id: 'curated_1',
    title: 'Mind-Bending Neo-Noirs & Cryptic Puzzles',
    description: 'Films that pull the psychological rug out from beneath reality. Labyrinths, fractured memory, and rain-slicked existential dread.',
    author: 'PlotHole Vault',
    item_count: 8,
    badge: 'Staff Signature',
    tag: 'Mind-Bender',
    preview_posters: [
      '/gEU2QniE6E7vNIvN2mOYDc3eJ5R.jpg',
      '/3bhkrj6PjOqZEjj9949wY2m64wP.jpg',
      '/d5iIlvfj0tIQlhJ78Veeu0z7PP7.jpg'
    ],
    items: [
      { tmdb_movie_id: 1339713, title: 'Dune: Part Two', release_date: '2024-03-01', poster_path: '/gEU2QniE6E7vNIvN2mOYDc3eJ5R.jpg' },
      { tmdb_movie_id: 1081003, title: 'Interstellar', release_date: '2014-11-05', poster_path: '/3bhkrj6PjOqZEjj9949wY2m64wP.jpg' },
      { tmdb_movie_id: 1275779, title: 'Shutter Island', release_date: '2010-02-19', poster_path: '/d5iIlvfj0tIQlhJ78Veeu0z7PP7.jpg' },
      { tmdb_movie_id: 84958, title: 'Blade Runner 2049', release_date: '2017-10-04', poster_path: '/voHU16Vm61whwZ6Y2AIgl7ic1k0.jpg' }
    ]
  },
  {
    id: 'curated_2',
    title: 'Teachers Who Made a Difference (Or Broke Minds)',
    description: 'From inspiring classroom catalysts to borderline psychopathic mentorship. Lessons engraved in celluloid.',
    author: 'Editorial Desk',
    item_count: 6,
    badge: 'Editorial Pick',
    tag: 'Drama / Tension',
    preview_posters: [
      '/d5iIlvfj0tIQlhJ78Veeu0z7PP7.jpg',
      '/voHU16Vm61whwZ6Y2AIgl7ic1k0.jpg',
      '/3bhkrj6PjOqZEjj9949wY2m64wP.jpg'
    ],
    items: [
      { tmdb_movie_id: 1275779, title: 'Whiplash', release_date: '2014-10-10', poster_path: '/d5iIlvfj0tIQlhJ78Veeu0z7PP7.jpg' },
      { tmdb_movie_id: 1081003, title: 'Dead Poets Society', release_date: '1989-06-02', poster_path: '/3bhkrj6PjOqZEjj9949wY2m64wP.jpg' },
      { tmdb_movie_id: 84958, title: 'Good Will Hunting', release_date: '1997-12-05', poster_path: '/voHU16Vm61whwZ6Y2AIgl7ic1k0.jpg' }
    ]
  },
  {
    id: 'curated_3',
    title: 'Small Towns, Big Crimes: Isolated Brutality',
    description: 'Grim secrets festering behind picket fences and desolate winter frost. When murder disrupts sleepy provincial life.',
    author: 'Crime Chronicles',
    item_count: 7,
    badge: 'Noir Special',
    tag: 'Crime Thriller',
    preview_posters: [
      '/voHU16Vm61whwZ6Y2AIgl7ic1k0.jpg',
      '/gEU2QniE6E7vNIvN2mOYDc3eJ5R.jpg',
      '/3bhkrj6PjOqZEjj9949wY2m64wP.jpg'
    ],
    items: [
      { tmdb_movie_id: 84958, title: 'Mirzapur', release_date: '2018-11-16', poster_path: '/voHU16Vm61whwZ6Y2AIgl7ic1k0.jpg' },
      { tmdb_movie_id: 1081003, title: 'Fargo', release_date: '1996-03-08', poster_path: '/3bhkrj6PjOqZEjj9949wY2m64wP.jpg' },
      { tmdb_movie_id: 1339713, title: 'Three Billboards', release_date: '2017-11-10', poster_path: '/gEU2QniE6E7vNIvN2mOYDc3eJ5R.jpg' }
    ]
  },
  {
    id: 'curated_4',
    title: 'Cinema As A Painting: Visually Stunning Works',
    description: 'Every frame a museum canvas. Masterful color theory, anamorphic lensing, and world-building that defies gravity.',
    author: 'Aesthetics Guild',
    item_count: 10,
    badge: 'Masterwork',
    tag: 'Pure Cinema',
    preview_posters: [
      '/3bhkrj6PjOqZEjj9949wY2m64wP.jpg',
      '/gEU2QniE6E7vNIvN2mOYDc3eJ5R.jpg',
      '/d5iIlvfj0tIQlhJ78Veeu0z7PP7.jpg'
    ],
    items: [
      { tmdb_movie_id: 1081003, title: '2001: A Space Odyssey', release_date: '1968-04-02', poster_path: '/3bhkrj6PjOqZEjj9949wY2m64wP.jpg' },
      { tmdb_movie_id: 1339713, title: 'Dune: Part Two', release_date: '2024-03-01', poster_path: '/gEU2QniE6E7vNIvN2mOYDc3eJ5R.jpg' },
      { tmdb_movie_id: 1275779, title: 'The Grand Budapest Hotel', release_date: '2014-02-26', poster_path: '/d5iIlvfj0tIQlhJ78Veeu0z7PP7.jpg' }
    ]
  }
];

export default function ListsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const initialTab = searchParams.get('tab') === 'discover' ? 'curated' : 'all';
  const [activeFilter, setActiveFilter] = useState(initialTab);

  // Sync tab if url param changes
  useEffect(() => {
    if (searchParams.get('tab') === 'discover') {
      setActiveFilter('curated');
    }
  }, [searchParams]);

  // Fetch single list details
  const { data: listDetails, isLoading: listLoading } = useQuery({
    queryKey: ['singleList', id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/lists/${id}`);
      if (!res.ok) throw new Error('List not found');
      return res.json();
    },
    enabled: !!id
  });

  // Fetch current user lists
  const { data: userLists = [], isLoading: userListsLoading } = useQuery({
    queryKey: ['currentUserLists', user?.username],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/lists/user/${user.username}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !id && !!user?.username
  });

  const deleteListMutation = useMutation({
    mutationFn: async (listId) => {
      const token = localStorage.getItem('plothole_token');
      const res = await fetch(`${API_URL}/lists/${listId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete list');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserLists', user?.username] });
      queryClient.invalidateQueries({ queryKey: ['userLists', user?.username] });
      addToast('List deleted', 'info');
    },
    onError: () => {
      addToast('Failed to delete list', 'error');
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: async ({ listId, movieId }) => {
      const token = localStorage.getItem('plothole_token');
      const res = await fetch(`${API_URL}/lists/${listId}/items/${movieId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to remove item');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['singleList', id] });
      addToast('Movie removed from list', 'info');
    },
    onError: () => {
      addToast('Failed to remove item', 'error');
    }
  });

  const handleDeleteList = (listId) => {
    if (!window.confirm('Are you sure you want to delete this list?')) return;
    deleteListMutation.mutate(listId);
  };

  const handleRemoveItem = (listId, movieId) => {
    removeItemMutation.mutate({ listId, movieId });
  };

  // State for Add Movie to List Modal
  const [showAddMovieSearch, setShowAddMovieSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedMovieIds, setAddedMovieIds] = useState(new Set());
  const [addingMovieId, setAddingMovieId] = useState(null);

  // Search movies on query change with debounce
  useEffect(() => {
    if (!showAddMovieSearch || !searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`${API_URL}/movies/search?query=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || data || []);
        }
      } catch (err) {
        console.error('Failed to search movies:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, showAddMovieSearch]);

  const loading = id ? listLoading : userListsLoading;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 text-[#e50914] font-mono text-xs space-y-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="tracking-widest uppercase font-bold">Loading Cinema Lists...</span>
      </div>
    );
  }

  const handleAddMovieDirectly = async (movie) => {
    if (!id || !movie) return;
    setAddingMovieId(movie.id);

    const mediaType = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
    const title = movie.title || movie.name;

    try {
      const res = await fetch(`${API_URL}/lists/${id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('plothole_token')}`
        },
        body: JSON.stringify({
          tmdb_movie_id: movie.id,
          media_type: mediaType,
          title: title,
          poster_path: movie.poster_path,
          release_date: movie.release_date || movie.first_air_date
        })
      });

      if (res.ok) {
        setAddedMovieIds((prev) => new Set([...prev, movie.id]));
        queryClient.invalidateQueries({ queryKey: ['singleList', id] });
        queryClient.invalidateQueries({ queryKey: ['currentUserLists'] });
        queryClient.invalidateQueries({ queryKey: ['userLists'] });
        addToast(`Added "${title}" to list!`, 'success');
      } else {
        const err = await res.json();
        addToast(err.error || 'Failed to add movie to list', 'error');
      }
    } catch (err) {
      addToast('Error adding movie to list', 'error');
    } finally {
      setAddingMovieId(null);
    }
  };

  // Single List View
  if (id && listDetails) {
    return (
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-10 space-y-6 md:space-y-8 text-left font-sans">
        <Link
          to={user ? `/profile/${listDetails.username}` : '/lists'}
          className="inline-flex items-center gap-2 font-mono text-xs font-bold text-slate-400 hover:text-[#ff2e3b] transition-colors uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </Link>

        {/* List Header with Transparent Liquid GlassSurface */}
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={24}
          backgroundOpacity={0.35}
          blur={12}
          borderOpacity={0.12}
          className="shadow-[0_12px_36px_rgba(0,0,0,0.7),0_0_20px_rgba(229,9,20,0.04)]"
        >
          <div className="p-6 md:p-8 space-y-4 w-full text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#e50914]/15 text-[#ff4d5a] font-mono text-[10px] font-black uppercase border border-[#e50914]/30 shadow-[0_0_10px_rgba(229,9,20,0.2)] tracking-widest">
                    Curated Collection
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-300 bg-black/40 px-2.5 py-0.5 rounded-full border border-white/10">
                    {listDetails.items?.length || 0} Titles
                  </span>
                </div>
                <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-white">
                  {listDetails.title}
                </h1>
                <div className="flex items-center gap-3 mt-2.5 font-mono text-xs text-slate-300">
                  <Link
                    to={`/profile/${listDetails.username}`}
                    className="flex items-center gap-2 hover:text-[#ff2e3b] transition-colors"
                  >
                    <Avatar username={listDetails.username} url={listDetails.avatar_url} className="w-6 h-6 border border-white/20" />
                    <span className="font-bold text-slate-100">@{listDetails.username}</span>
                  </Link>
                </div>
              </div>

              {user && user.id === listDetails.user_id && (
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => setShowAddMovieSearch(true)}
                    className="glass-btn-red py-2 px-4 text-xs inline-flex items-center gap-2 shadow-md font-bold font-display uppercase tracking-wider cursor-pointer"
                  >
                    <ListPlus className="w-4 h-4" />
                    <span>Add Movies</span>
                  </button>

                  <button
                    onClick={() => handleDeleteList(listDetails.id)}
                    className="btn-danger py-2 px-4 text-xs inline-flex items-center gap-2 shadow-md font-bold font-display uppercase tracking-wider"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete List</span>
                  </button>
                </div>
              )}
            </div>

            {listDetails.description && (
              <p className="font-sans text-xs sm:text-sm text-slate-100 font-medium italic bg-black/40 p-4 rounded-2xl border border-white/5 leading-relaxed relative z-10">
                "{listDetails.description}"
              </p>
            )}
          </div>
        </GlassSurface>

        {/* List Items Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/8 pb-3">
            <h2 className="font-display font-bold text-lg sm:text-2xl text-slate-100 flex items-center gap-2">
              <Film className="w-5 h-5 text-[#e50914]" />
              <span>Films in this Collection ({listDetails.items?.length || 0})</span>
            </h2>
            {user && user.id === listDetails.user_id && (
              <button
                onClick={() => setShowAddMovieSearch(true)}
                className="text-xs font-mono text-[#ff4d5a] hover:text-white font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>+ Add Films</span>
              </button>
            )}
          </div>

          {!listDetails.items || listDetails.items.length === 0 ? (
            <div className="border border-white/8 bg-[#121216] p-12 rounded-3xl text-center text-slate-400 font-mono text-xs space-y-3">
              <Film className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-300 font-semibold text-sm">No films added to this list yet.</p>
              <p className="text-slate-500">Search cinema titles and add them right now!</p>
              {user && user.id === listDetails.user_id && (
                <button
                  onClick={() => setShowAddMovieSearch(true)}
                  className="glass-btn-red py-2.5 px-6 rounded-2xl text-xs font-display font-bold uppercase tracking-wider cursor-pointer"
                >
                  Add Your First Movie
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
              {listDetails.items.map((item) => (
                <div key={item.tmdb_movie_id} className="relative group">
                  <MovieCard
                    movie={{
                      id: item.tmdb_movie_id,
                      media_type: item.media_type,
                      title: item.title,
                      name: item.title,
                      poster_path: item.poster_path,
                      release_date: item.release_date
                    }}
                  />
                  {user && user.id === listDetails.user_id && (
                    <button
                      onClick={() => handleRemoveItem(listDetails.id, item.tmdb_movie_id)}
                      className="absolute top-2 right-2 z-20 bg-rose-600/90 text-white p-1.5 rounded-lg opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg cursor-pointer"
                      title="Remove from list"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Movie Search Modal */}
        {showAddMovieSearch && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-2xl animate-fade-in">
            <div className="w-full max-w-lg rounded-3xl overflow-hidden border border-white/14 bg-[#121218]/95 text-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_30px_rgba(229,9,20,0.12)] p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-white/8 pb-3">
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-[#e50914]" />
                  <h3 className="font-display font-black text-base text-white uppercase tracking-wider">
                    Add Films to "{listDetails.title}"
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowAddMovieSearch(false);
                    setSearchQuery('');
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Search Bar Input */}
              <div>
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type film or series title..."
                  className="w-full px-4 py-3 bg-black/60 border border-white/12 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e50914] transition-colors"
                />
              </div>

              {/* Search Results List */}
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {isSearching ? (
                  <div className="p-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#e50914]" />
                    <span className="text-[11px] font-mono mt-2 block">Searching cinema database...</span>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs font-mono">
                    {searchQuery.trim() ? 'No matching films found.' : 'Search for any movie or series to add to this list.'}
                  </div>
                ) : (
                  searchResults.slice(0, 10).map((m) => {
                    const isAlreadyInList = listDetails.items?.some((it) => it.tmdb_movie_id === m.id) || addedMovieIds.has(m.id);
                    const isAdding = addingMovieId === m.id;
                    const mTitle = m.title || m.name;
                    const mYear = (m.release_date || m.first_air_date || '').split('-')[0];

                    return (
                      <div
                        key={m.id}
                        className="p-2.5 bg-white/5 border border-white/8 hover:border-white/20 rounded-2xl flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=92&auto=format&fit=crop'}
                            alt={mTitle}
                            className="w-9 h-12 object-cover rounded-xl border border-white/10 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-display font-bold text-xs text-slate-100 truncate">{mTitle}</p>
                            <p className="text-[10px] font-mono text-slate-400">{mYear} • {m.media_type === 'tv' ? 'TV Series' : 'Film'}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddMovieDirectly(m)}
                          disabled={isAlreadyInList || isAdding}
                          className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                            isAlreadyInList
                              ? 'bg-[#e50914]/20 text-[#ff4d5a] border border-[#e50914]/40'
                              : 'bg-white/10 text-white hover:bg-[#e50914] border border-white/10'
                          }`}
                        >
                          {isAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isAlreadyInList ? 'Added ✓' : '+ Add'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-white/8">
                <button
                  onClick={() => {
                    setShowAddMovieSearch(false);
                    setSearchQuery('');
                  }}
                  className="btn-secondary px-5 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // General Lists Overview
  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-10 space-y-6 md:space-y-8 text-left font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/8 pb-5">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-white flex items-center gap-2.5">
            <FolderPlus className="w-6 h-6 sm:w-7 sm:h-7 text-[#e50914]" />
            <span>Custom Cinema Lists</span>
          </h1>
          <p className="font-mono text-xs text-slate-400 mt-1">
            Curate, organize, and share themed film & TV collections
          </p>
        </div>

        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="glass-btn-red py-2.5 px-5 rounded-xl text-xs flex items-center justify-center gap-2 self-start sm:self-auto font-display font-black uppercase tracking-wider shadow-md cursor-pointer"
          >
            <ListPlus className="w-4 h-4" />
            <span>Create New List</span>
          </button>
        )}
      </div>

      {/* AICanvas Realistic Liquid Glass Tab Bar */}
      <GlassTabBar
        tabs={[
          { id: 'all', label: 'All Collections', icon: FolderPlus, count: (userLists.length + CURATED_COLLECTIONS.length) },
          { id: 'curated', label: 'Hall of Fame Picks', icon: Trophy, count: CURATED_COLLECTIONS.length },
          { id: 'myLists', label: 'My Collections', icon: User, count: userLists.length }
        ]}
        activeTab={activeFilter}
        onTabChange={setActiveFilter}
        className="w-full sm:w-fit"
      />

      {/* When Curated Tab is Active */}
      {activeFilter === 'curated' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 sm:gap-6">
          {CURATED_COLLECTIONS.map((col) => (
            <GlassCard
              key={col.id}
              className="p-6 space-y-5 rounded-3xl flex flex-col justify-between border-white/10 hover:border-[#ff6b00]/40 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#ff5500]/15 text-[#ffa033] border border-[#ff5500]/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                    {col.badge}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {col.item_count} Masterworks
                  </span>
                </div>

                <h3 className="font-display font-black text-xl text-white tracking-tight leading-snug">
                  {col.title}
                </h3>

                <p className="font-sans text-xs text-slate-300 italic leading-relaxed">
                  "{col.description}"
                </p>

                {/* Film Postcard Stack Preview */}
                <div className="flex items-center gap-2 pt-2">
                  {col.items.map((m) => (
                    <Link
                      key={m.tmdb_movie_id}
                      to={`/media/movie/${m.tmdb_movie_id}`}
                      className="w-14 h-20 rounded-xl overflow-hidden border border-white/12 hover:scale-105 hover:border-[#ff6b00] transition-all shadow-md shrink-0"
                      title={m.title}
                    >
                      <img
                        src={getPosterUrl(m.poster_path, 'w185')}
                        alt={m.title}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/8 font-mono text-xs">
                <span className="text-slate-400 text-[11px]">
                  Curated by <strong className="text-slate-200">{col.author}</strong>
                </span>
                <span className="text-[#ff4d5a] font-bold text-xs uppercase flex items-center gap-1 font-display tracking-wider">
                  <span>Explore Titles</span>
                  <span>→</span>
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : activeFilter === 'myLists' && !user ? (
        <div className="glass-panel p-8 sm:p-12 rounded-3xl text-center space-y-4">
          <Layers className="w-10 h-10 sm:w-12 sm:h-12 text-[#e50914] mx-auto" />
          <h2 className="font-display font-black text-xl sm:text-2xl text-slate-100 tracking-tight">Sign In to View Your Collections</h2>
          <p className="font-sans text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Create custom ranked movie lists, marathon watchlists, and favorite director picks to showcase on your profile.
          </p>
          <Link to="/login" className="glass-btn-red inline-block py-2.5 px-6 rounded-2xl text-xs font-display font-bold uppercase tracking-wider">
            Sign In Now
          </Link>
        </div>
      ) : activeFilter === 'myLists' && userLists.length === 0 ? (
        <div className="glass-panel p-8 sm:p-12 rounded-3xl text-center space-y-4">
          <FolderPlus className="w-10 h-10 sm:w-12 sm:h-12 text-[#e50914] mx-auto" />
          <h2 className="font-display font-black text-xl sm:text-2xl text-slate-100 tracking-tight">You Have No Custom Lists Yet</h2>
          <p className="font-sans text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Start curating your cinephile collections right now!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="glass-btn-red py-2.5 px-6 rounded-2xl text-xs font-display font-bold uppercase tracking-wider cursor-pointer"
          >
            Create Your First List
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* User Custom Lists (if any) */}
          {userLists.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-base text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4 text-[#ff4d5a]" />
                <span>Your Collections ({userLists.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {userLists.map((lst) => (
                  <GlassCard
                    key={lst.id}
                    className="p-5 sm:p-6 space-y-4 rounded-3xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#e50914]/10 text-[#ff4d5a] border border-[#e50914]/20 text-[10px] font-mono font-semibold uppercase">
                          Collection
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {lst.item_count || 0} Titles
                        </span>
                      </div>

                      <Link to={`/collections/${lst.id}`}>
                        <h3 className="font-display font-black text-lg sm:text-xl text-slate-100 hover:text-[#ff3b47] transition-colors line-clamp-1 tracking-tight">
                          {lst.title}
                        </h3>
                      </Link>

                      {lst.description && (
                        <p className="font-sans text-xs text-slate-300 mt-2 line-clamp-2 italic leading-relaxed">
                          "{lst.description}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/8 font-mono text-xs">
                      <Link
                        to={`/collections/${lst.id}`}
                        className="text-[#ff4d5a] hover:text-white font-bold text-xs uppercase flex items-center gap-1 font-display tracking-wider"
                      >
                        <span>Explore List</span>
                        <span>→</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteList(lst.id)}
                        className="text-slate-400 hover:text-rose-400 p-1.5 rounded-xl hover:bg-rose-500/10 transition-all cursor-pointer"
                        title="Delete list"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Curated Hall of Fame Collections */}
          <div className="space-y-4">
            <h2 className="font-display font-bold text-base text-slate-300 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#ffa033]" />
              <span>Curated Hall of Fame Staff Playlists</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 sm:gap-6">
              {CURATED_COLLECTIONS.map((col) => (
                <GlassCard
                  key={col.id}
                  className="p-6 space-y-5 rounded-3xl flex flex-col justify-between border-white/10 hover:border-[#ff6b00]/40 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#ff5500]/15 text-[#ffa033] border border-[#ff5500]/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                        {col.badge}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {col.item_count} Masterworks
                      </span>
                    </div>

                    <h3 className="font-display font-black text-xl text-white tracking-tight leading-snug">
                      {col.title}
                    </h3>

                    <p className="font-sans text-xs text-slate-300 italic leading-relaxed">
                      "{col.description}"
                    </p>

                    {/* Film Postcard Stack Preview */}
                    <div className="flex items-center gap-2 pt-2">
                      {col.items.map((m) => (
                        <Link
                          key={m.tmdb_movie_id}
                          to={`/media/movie/${m.tmdb_movie_id}`}
                          className="w-14 h-20 rounded-xl overflow-hidden border border-white/12 hover:scale-105 hover:border-[#ff6b00] transition-all shadow-md shrink-0"
                          title={m.title}
                        >
                          <img
                            src={getPosterUrl(m.poster_path, 'w185')}
                            alt={m.title}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/8 font-mono text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Curated by <strong className="text-slate-200">{col.author}</strong>
                    </span>
                    <span className="text-[#ff4d5a] font-bold text-xs uppercase flex items-center gap-1 font-display tracking-wider">
                      <span>Explore Titles</span>
                      <span>→</span>
                    </span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      )}

      <CreateListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onListCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['currentUserLists', user?.username] });
          queryClient.invalidateQueries({ queryKey: ['userLists', user?.username] });
        }}
      />
    </div>
  );
}
