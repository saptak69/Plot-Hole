import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ListPlus, Trash2, Film, Loader2, ArrowLeft, FolderPlus, Layers, Trophy, User, Sparkles, Flame, Bookmark, X } from 'lucide-react';
import { API_URL, getPosterUrl } from '../config';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';
import MovieCard from '../components/MovieCard';
import CreateListModal from '../components/CreateListModal';

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

function ListPosterGrid({ posters, listId }) {
  if (!posters || posters.length === 0) {
    return (
      <div className="w-full h-32 sm:h-40 bg-bg-surface rounded-xl border border-border flex items-center justify-center">
        <Film className="w-6 h-6 text-text-muted" />
      </div>
    );
  }

  // Graceful degradation for < 4 posters
  if (posters.length === 1) {
    return (
      <Link to={`/collections/${listId}`} className="block w-full h-32 sm:h-40 rounded-xl overflow-hidden border border-border hover:border-accent transition-colors relative group">
        <img src={getPosterUrl(posters[0], 'w342')} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </Link>
    );
  }
  
  if (posters.length === 2) {
    return (
      <Link to={`/collections/${listId}`} className="grid grid-cols-2 gap-1 h-32 sm:h-40 rounded-xl overflow-hidden border border-border hover:border-accent transition-colors group bg-bg-surface">
        {posters.map((p, i) => (
          <div key={i} className="relative w-full h-full overflow-hidden">
             <img src={getPosterUrl(p, 'w185')} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        ))}
      </Link>
    );
  }

  if (posters.length === 3) {
    return (
      <Link to={`/collections/${listId}`} className="grid grid-cols-2 gap-1 h-32 sm:h-40 rounded-xl overflow-hidden border border-border hover:border-accent transition-colors group bg-bg-surface">
         <div className="col-span-1 row-span-2 relative w-full h-full overflow-hidden">
             <img src={getPosterUrl(posters[0], 'w185')} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
         </div>
         <div className="flex flex-col gap-1 w-full h-full">
           <div className="relative w-full h-full overflow-hidden">
               <img src={getPosterUrl(posters[1], 'w185')} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
           </div>
           <div className="relative w-full h-full overflow-hidden">
               <img src={getPosterUrl(posters[2], 'w185')} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
           </div>
         </div>
      </Link>
    );
  }

  // 4 or more
  return (
    <Link to={`/collections/${listId}`} className="grid grid-cols-2 grid-rows-2 gap-1 h-32 sm:h-40 rounded-xl overflow-hidden border border-border hover:border-accent transition-colors group bg-bg-surface">
      {posters.slice(0, 4).map((p, i) => (
        <div key={i} className="relative w-full h-full overflow-hidden">
           <img src={getPosterUrl(p, 'w185')} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      ))}
    </Link>
  );
}

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
      <div className="flex-1 flex flex-col items-center justify-center p-20 text-accent font-mono text-xs space-y-3">
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
          className="inline-flex items-center gap-2 font-mono text-xs font-bold text-text-secondary hover:text-text-primary transition-colors uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </Link>

        {/* List Header Card */}
        <div className="bg-bg-elevated border border-border rounded-3xl p-6 md:p-8 space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent font-mono text-[10px] font-black uppercase border border-accent/20 tracking-widest">
                  Curated Collection
                </span>
                <span className="font-mono text-xs font-bold text-text-secondary bg-bg-surface px-2.5 py-0.5 rounded-full border border-border">
                  {listDetails.items?.length || 0} Titles
                </span>
              </div>
              <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-text-primary">
                {listDetails.title}
              </h1>
              <div className="flex items-center gap-3 mt-2.5 font-mono text-xs text-text-secondary">
                <Link
                  to={`/profile/${listDetails.username}`}
                  className="flex items-center gap-2 hover:text-accent transition-colors"
                >
                  <Avatar username={listDetails.username} url={listDetails.avatar_url} className="w-6 h-6 border border-border" />
                  <span className="font-bold text-text-primary">@{listDetails.username}</span>
                </Link>
              </div>
            </div>

            {user && user.id === listDetails.user_id && (
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setShowAddMovieSearch(true)}
                  className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-2 shadow-sm font-bold font-display uppercase tracking-wider cursor-pointer"
                >
                  <ListPlus className="w-4 h-4" />
                  <span>Add Movies</span>
                </button>

                <button
                  onClick={() => handleDeleteList(listDetails.id)}
                  className="bg-error/10 hover:bg-error/20 text-error border border-error/20 rounded-xl py-2 px-4 text-xs inline-flex items-center gap-2 shadow-sm font-bold font-display uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete List</span>
                </button>
              </div>
            )}
          </div>

          {listDetails.description && (
            <p className="font-sans text-xs sm:text-sm text-text-secondary font-medium italic bg-bg-surface p-4 rounded-2xl border border-border leading-relaxed relative z-10">
              "{listDetails.description}"
            </p>
          )}
        </div>

        {/* List Items Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-display font-bold text-lg sm:text-2xl text-text-primary flex items-center gap-2">
              <Film className="w-5 h-5 text-accent" />
              <span>Films in this Collection ({listDetails.items?.length || 0})</span>
            </h2>
            {user && user.id === listDetails.user_id && (
              <button
                onClick={() => setShowAddMovieSearch(true)}
                className="text-xs font-mono text-accent hover:text-text-primary font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>+ Add Films</span>
              </button>
            )}
          </div>

          {!listDetails.items || listDetails.items.length === 0 ? (
            <div className="border border-border bg-bg-surface p-12 rounded-3xl text-center text-text-secondary font-mono text-xs space-y-3 shadow-sm">
              <Film className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-text-primary font-semibold text-sm">No films added to this list yet.</p>
              <p className="text-text-secondary">Search cinema titles and add them right now!</p>
              {user && user.id === listDetails.user_id && (
                <button
                  onClick={() => setShowAddMovieSearch(true)}
                  className="btn-primary py-2.5 px-6 rounded-xl text-xs font-display font-bold uppercase tracking-wider cursor-pointer mt-2 inline-block"
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
                      className="absolute top-2 right-2 z-20 bg-error text-white p-1.5 rounded-lg opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg cursor-pointer"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm" onClick={() => { setShowAddMovieSearch(false); setSearchQuery(''); }} />
            <div className="relative w-full max-w-lg rounded-3xl overflow-hidden border border-border bg-bg-elevated shadow-lg p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-accent" />
                  <h3 className="font-display font-black text-base text-text-primary uppercase tracking-wider">
                    Add Films to "{listDetails.title}"
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowAddMovieSearch(false);
                    setSearchQuery('');
                  }}
                  className="p-1.5 rounded-full hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
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
                  className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Search Results List */}
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {isSearching ? (
                  <div className="p-8 text-center text-text-secondary">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-accent" />
                    <span className="text-[11px] font-mono mt-2 block">Searching cinema database...</span>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-8 text-center text-text-muted text-xs font-mono">
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
                        className="p-2.5 bg-bg-surface border border-border hover:border-border-hover rounded-2xl flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=92&auto=format&fit=crop'}
                            alt={mTitle}
                            className="w-9 h-12 object-cover rounded-xl border border-border shrink-0 bg-bg-elevated"
                          />
                          <div className="min-w-0">
                            <p className="font-display font-bold text-xs text-text-primary truncate">{mTitle}</p>
                            <p className="text-[10px] font-mono text-text-secondary">{mYear} • {m.media_type === 'tv' ? 'TV Series' : 'Film'}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddMovieDirectly(m)}
                          disabled={isAlreadyInList || isAdding}
                          className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                            isAlreadyInList
                              ? 'bg-accent/10 text-accent border border-accent/20'
                              : 'bg-bg-elevated text-text-primary hover:bg-bg-hover border border-border'
                          }`}
                        >
                          {isAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isAlreadyInList ? 'Added ✓' : '+ Add'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-text-primary flex items-center gap-2.5">
            <FolderPlus className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
            <span>Custom Cinema Lists</span>
          </h1>
          <p className="font-mono text-xs text-text-secondary mt-1">
            Curate, organize, and share themed film & TV collections
          </p>
        </div>

        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary py-2.5 px-5 rounded-xl text-xs flex items-center justify-center gap-2 self-start sm:self-auto font-display font-bold uppercase tracking-wider shadow-sm cursor-pointer"
          >
            <ListPlus className="w-4 h-4" />
            <span>Create New List</span>
          </button>
        )}
      </div>

      <SimpleTabBar
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
            <div
              key={col.id}
              className="bg-bg-elevated p-6 space-y-5 rounded-3xl flex flex-col justify-between border border-border hover:border-accent transition-colors shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 text-[10px] font-mono font-bold uppercase tracking-wider">
                    {col.badge}
                  </span>
                  <span className="text-[11px] font-mono text-text-secondary">
                    {col.item_count} Masterworks
                  </span>
                </div>

                <h3 className="font-display font-black text-xl text-text-primary tracking-tight leading-snug">
                  {col.title}
                </h3>

                <p className="font-sans text-xs text-text-secondary italic leading-relaxed">
                  "{col.description}"
                </p>

                {/* Film Postcard Stack Preview */}
                <div className="flex items-center gap-2 pt-2">
                  {col.items.map((m) => (
                    <Link
                      key={m.tmdb_movie_id}
                      to={`/media/movie/${m.tmdb_movie_id}`}
                      className="w-14 h-20 rounded-xl overflow-hidden border border-border hover:scale-105 hover:border-accent transition-all shadow-sm shrink-0 bg-bg-surface"
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

              <div className="flex items-center justify-between pt-3 border-t border-border font-mono text-xs">
                <span className="text-text-secondary text-[11px]">
                  Curated by <strong className="text-text-primary">{col.author}</strong>
                </span>
                <span className="text-accent font-bold text-xs uppercase flex items-center gap-1 font-display tracking-wider">
                  <span>Explore Titles</span>
                  <span>→</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : activeFilter === 'myLists' && !user ? (
        <div className="bg-bg-elevated border border-border p-8 sm:p-12 rounded-3xl text-center space-y-4 shadow-sm">
          <Layers className="w-10 h-10 sm:w-12 sm:h-12 text-accent mx-auto" />
          <h2 className="font-display font-black text-xl sm:text-2xl text-text-primary tracking-tight">Sign In to View Your Collections</h2>
          <p className="font-sans text-xs sm:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            Create custom ranked movie lists, marathon watchlists, and favorite director picks to showcase on your profile.
          </p>
          <Link to="/login" className="btn-primary inline-block py-2.5 px-6 rounded-xl text-xs font-display font-bold uppercase tracking-wider mt-2">
            Sign In Now
          </Link>
        </div>
      ) : activeFilter === 'myLists' && userLists.length === 0 ? (
        <div className="bg-bg-elevated border border-border p-8 sm:p-12 rounded-3xl text-center space-y-4 shadow-sm">
          <FolderPlus className="w-10 h-10 sm:w-12 sm:h-12 text-accent mx-auto" />
          <h2 className="font-display font-black text-xl sm:text-2xl text-text-primary tracking-tight">You Have No Custom Lists Yet</h2>
          <p className="font-sans text-xs sm:text-sm text-text-secondary max-w-md mx-auto">
            Start curating your cinephile collections right now!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary py-2.5 px-6 rounded-xl text-xs font-display font-bold uppercase tracking-wider cursor-pointer mt-2 inline-block"
          >
            Create Your First List
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* User Custom Lists (if any) */}
          {userLists.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-base text-text-secondary flex items-center gap-2">
                <User className="w-4 h-4 text-accent" />
                <span>Your Collections ({userLists.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {userLists.map((lst) => (
                  <div
                    key={lst.id}
                    className="bg-bg-elevated border border-border p-5 sm:p-6 space-y-4 rounded-3xl flex flex-col justify-between hover:border-border-hover transition-colors shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 text-[10px] font-mono font-semibold uppercase">
                          Collection
                        </span>
                        <span className="text-[11px] font-mono text-text-secondary">
                          {lst.item_count || 0} Titles
                        </span>
                      </div>

                      <Link to={`/collections/${lst.id}`}>
                        <h3 className="font-display font-black text-lg sm:text-xl text-text-primary hover:text-accent transition-colors leading-tight tracking-tight">
                          {lst.title}
                        </h3>
                      </Link>

                      <div className="pt-2">
                        <ListPosterGrid posters={lst.preview_posters ? lst.preview_posters.split(',') : []} listId={lst.id} />
                      </div>

                      {lst.description && (
                        <p className="font-sans text-xs text-text-secondary mt-2 line-clamp-2 italic leading-relaxed">
                          "{lst.description}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border font-mono text-xs">
                      <Link
                        to={`/collections/${lst.id}`}
                        className="text-accent hover:text-text-primary font-bold text-xs uppercase flex items-center gap-1 font-display tracking-wider"
                      >
                        <span>Explore List</span>
                        <span>→</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteList(lst.id)}
                        className="text-text-muted hover:text-error p-1.5 rounded-xl hover:bg-error/10 transition-colors cursor-pointer"
                        title="Delete list"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curated Hall of Fame Collections */}
          <div className="space-y-4">
            <h2 className="font-display font-bold text-base text-text-secondary flex items-center gap-2">
              <Trophy className="w-4 h-4 text-gold" />
              <span>Curated Hall of Fame Staff Playlists</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 sm:gap-6">
              {CURATED_COLLECTIONS.map((col) => (
                <div
                  key={col.id}
                  className="bg-bg-elevated border border-border p-6 space-y-5 rounded-3xl flex flex-col justify-between hover:border-accent transition-colors shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 text-[10px] font-mono font-bold uppercase tracking-wider">
                        {col.badge}
                      </span>
                      <span className="text-[11px] font-mono text-text-secondary">
                        {col.item_count} Masterworks
                      </span>
                    </div>

                    <h3 className="font-display font-black text-xl text-text-primary tracking-tight leading-snug">
                      {col.title}
                    </h3>

                    <p className="font-sans text-xs text-text-secondary italic leading-relaxed">
                      "{col.description}"
                    </p>

                    <div className="pt-2">
                      <ListPosterGrid posters={col.preview_posters || []} listId={col.id} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border font-mono text-xs">
                    <span className="text-text-secondary text-[11px]">
                      Curated by <strong className="text-text-primary">{col.author}</strong>
                    </span>
                    <span className="text-accent font-bold text-xs uppercase flex items-center gap-1 font-display tracking-wider">
                      <span>Explore Titles</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>
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
