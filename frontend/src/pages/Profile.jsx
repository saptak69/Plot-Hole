import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, AlertCircle, Camera, Edit3, X, Download, Award, Star, Film, Clock, Heart, FolderPlus, Bookmark, Eye, MessageSquare } from 'lucide-react';
import { API_URL, getAuthHeaders, getPosterUrl } from '../config';
import { useAuth } from '../context/AuthContext';
import RatingBadge from '../components/RatingBadge';
import Avatar from '../components/Avatar';
import MovieCard from '../components/MovieCard';
import GlassSurface from '../components/GlassSurface';
import GlassTabBar from '../components/GlassTabBar';
import GlassModal from '../components/GlassModal';
import GlassCard from '../components/GlassCard';

function PolaroidCard({ movieId, angle, initialMovie }) {
  const { data: movie } = useQuery({
    queryKey: ['movieDetails', movieId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/movies/${movieId}`);
      if (!res.ok) throw new Error('Not found');
      return res.json();
    },
    initialData: initialMovie,
    staleTime: 10 * 60 * 1000
  });

  if (!movie) return <div className="aspect-[3/4] bg-white/5 rounded-xl border border-white/8 skeleton-shimmer" />;

  return (
    <div
      className="polaroid-container relative transform transition-transform hover:scale-105 duration-300 select-none cursor-pointer"
      style={{ transform: `rotate(${angle * 0.5}deg)` }}
    >
      <Link to={`/media/${movie.media_type || 'movie'}/${movie.id}`}>
        <div className="aspect-square w-full overflow-hidden rounded-xl border border-white/10 mb-2 bg-black shadow-inner">
          <img
            src={getPosterUrl(movie.poster_path, 'w300')}
            alt={movie.title || movie.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <p className="font-display text-[10px] sm:text-[11px] font-bold text-slate-200 truncate text-center">
          {movie.title || movie.name}
        </p>
      </Link>
    </div>
  );
}

function WatchlistCard({ movieId, initialMovie }) {
  const { data: movie } = useQuery({
    queryKey: ['movieDetails', movieId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/movies/${movieId}`);
      if (!res.ok) throw new Error('Not found');
      return res.json();
    },
    initialData: initialMovie,
    staleTime: 10 * 60 * 1000
  });

  if (!movie) return <div className="aspect-[2/3] bg-white/5 rounded-2xl border border-white/8 skeleton-shimmer" />;

  return (
    <Link 
      to={`/media/${movie.media_type || 'movie'}/${movie.id}`} 
      className="group relative block rounded-2xl overflow-hidden bg-[#121216] border border-white/8 hover:border-[#e50914]/50 transition-all hover:-translate-y-1 shadow-lg"
    >
      <div className="aspect-[2/3] w-full">
        <img
          src={getPosterUrl(movie.poster_path, 'w300')}
          alt={movie.title || movie.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-2.5 bg-gradient-to-t from-black via-black/80 to-transparent">
        <p className="text-[11px] font-bold text-slate-200 truncate">{movie.title || movie.name}</p>
      </div>
    </Link>
  );
}

function DiaryMobileCard({ entry }) {
  const { data: movie } = useQuery({
    queryKey: ['movieDetailsSimple', entry.tmdb_movie_id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/movies/${entry.tmdb_movie_id}`);
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 1000 * 60 * 10
  });

  const title = movie?.title || movie?.name || `Film #${entry.tmdb_movie_id}`;
  const mediaType = movie?.media_type || entry.media_type || 'movie';

  return (
    <div className="glass-card p-4 rounded-2xl shadow-md space-y-3">
      <div className="flex items-center gap-3">
        <Link to={`/media/${mediaType}/${entry.tmdb_movie_id}`} className="shrink-0 w-14 h-20 rounded-xl overflow-hidden border border-white/10 bg-black shadow">
          <img
            src={getPosterUrl(movie?.poster_path, 'w185')}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </Link>
        <div className="flex-1 min-w-0 space-y-1.5">
          <Link to={`/media/${mediaType}/${entry.tmdb_movie_id}`} className="font-display font-bold text-sm text-slate-100 hover:text-[#ff2e3b] block truncate">
            {title}
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <RatingBadge rating={entry.rating} size="xs" />
            <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#ffb800]" />
              {entry.watched_date}
            </span>
          </div>
        </div>
      </div>

      {entry.review_text && (
        <p className="text-xs text-slate-300 italic bg-black/40 p-3 rounded-xl border border-white/5 leading-relaxed">
          "{entry.review_text}"
        </p>
      )}
    </div>
  );
}

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser, updateProfile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('diary');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editError, setEditError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch profile details
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['userProfile', username, currentUser?.id],
    queryFn: async () => {
      const currentUserIdParam = currentUser ? `?currentUserId=${currentUser.id}` : '';
      const res = await fetch(`${API_URL}/users/profile/${username}${currentUserIdParam}`);
      if (!res.ok) throw new Error('User not found');
      return res.json();
    }
  });

  const profileUser = profile?.user;
  const stats = profile?.stats;
  const isFollowing = profile?.isFollowing;

  // Fetch Rating Distribution Histogram
  const { data: ratingsDist = [] } = useQuery({
    queryKey: ['userRatingsDist', username],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/users/profile/${username}/ratings-dist`);
      if (res.ok) return res.json();
      return [];
    },
    enabled: !!profileUser
  });

  const openEditModal = () => {
    setEditBio(profileUser?.bio || '');
    setEditAvatar(profileUser?.avatar_url || '');
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setEditError('Photo is too large (max 15MB). Please choose a smaller image.');
      return;
    }

    setEditError('');

    // Automatic Client-Side Auto-Resize & Compression via Canvas
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 512; // High-definition 512x512 avatar
        let width = img.width;
        let height = img.height;

        // Center square crop & scale down
        const minDim = Math.min(width, height);
        const startX = (width - minDim) / 2;
        const startY = (height - minDim) / 2;

        canvas.width = Math.min(minDim, MAX_SIZE);
        canvas.height = Math.min(minDim, MAX_SIZE);

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
          img,
          startX,
          startY,
          minDim,
          minDim,
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Convert to high-quality compressed WebP/JPEG data URL (~50kb-100kb)
        const compressedDataUrl = canvas.toDataURL('image/webp', 0.88);
        setEditAvatar(compressedDataUrl);
      };
      img.onerror = () => {
        setEditError('Could not process image file.');
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setEditError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setEditError('');
    try {
      await updateProfile(editBio, editAvatar);
      queryClient.invalidateQueries({ queryKey: ['userProfile', username] });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      setEditError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/social/follow/${profileUser.id}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Action failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', username] });
    }
  });

  // Watchlist query
  const { data: watchlist = [], isLoading: watchlistLoading } = useQuery({
    queryKey: ['userWatchlist', username],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/watchlist/user/${username}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!profileUser
  });

  // Diary query
  const { data: diary = [], isLoading: diaryLoading } = useQuery({
    queryKey: ['userDiary', username],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/watched/user/${username}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!profileUser
  });

  // Unique diary items by movie id
  const uniqueDiary = useMemo(() => {
    const seen = new Set();
    return diary.filter((entry) => {
      if (!entry.tmdb_movie_id || seen.has(entry.tmdb_movie_id)) return false;
      seen.add(entry.tmdb_movie_id);
      return true;
    });
  }, [diary]);

  // Reviews query
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['userReviews', username],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/reviews/user/${username}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!profileUser
  });

  // Custom Lists query
  const { data: userLists = [], isLoading: listsLoading } = useQuery({
    queryKey: ['userCustomLists', username],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/lists/user/${username}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!profileUser
  });

  // Export Diary to CSV
  const handleExportData = () => {
    if (uniqueDiary.length === 0) return;
    const headers = 'ID,TMDB_ID,Watched_Date,Rating,Review\n';
    const rows = uniqueDiary
      .map((d) => `"${d.id}","${d.tmdb_movie_id}","${d.watched_date}","${d.rating || ''}","${(d.review_text || '').replace(/"/g, '""')}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${username}_plothole_diary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (profileLoading) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-20 flex flex-col items-center justify-center text-[#e50914] font-mono uppercase space-y-3">
        <div className="w-10 h-10 border-3 border-[#e50914] border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_15px_#e50914]" />
        <span className="text-xs tracking-widest font-bold">RETRIEVING PROFILE ARCHIVES...</span>
      </div>
    );
  }

  if (profileError || !profileUser) {
    return (
      <div className="flex-1 max-w-xl mx-auto px-4 py-24 text-center space-y-4 font-mono">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white uppercase">Cinephile Record Not Found</h2>
        <p className="text-xs text-slate-400 font-sans">
          The requested member dossier (@{username}) does not exist in the database.
        </p>
        <Link to="/" className="btn-primary inline-flex py-2 px-6 text-xs font-bold font-mono">
          Return to Discover
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === profileUser.id;
  const hoursWasted = Math.max(0, uniqueDiary.length * 2.1 + (stats?.reviews || 0) * 0.4);

  const topMovieIds =
    watchlist.length > 0
      ? watchlist.slice(0, 6).map((w) => w.tmdb_movie_id)
      : uniqueDiary.slice(0, 6).map((d) => d.tmdb_movie_id);

  const rotations = [-3, 2, -1.5, 2.5, -2, 1.5];

  // Process rating histogram
  const distMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let maxCount = 1;
  ratingsDist.forEach((r) => {
    const star = Math.round(parseFloat(r.rating) || 1);
    distMap[star] = (distMap[star] || 0) + parseInt(r.count || 0);
    if (distMap[star] > maxCount) maxCount = distMap[star];
  });

  // Calculate unlockable badges
  const badges = [
    { title: 'Film Marathoner', icon: Clock, unlocked: uniqueDiary.length >= 5, desc: 'Logged 5+ films' },
    { title: '5-Star Hunter', icon: Star, unlocked: diary.some((d) => d.rating >= 5), desc: 'Rated a film Pure Cinema' },
    { title: 'Zine Critic', icon: Film, unlocked: (stats?.reviews || 0) >= 3, desc: 'Wrote 3+ reviews' },
    { title: 'List Architect', icon: Award, unlocked: userLists.length >= 1, desc: 'Created a custom list' }
  ];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-10 font-sans space-y-6 sm:space-y-8 overflow-x-hidden">
      
      {/* ================= PROFILE HEADER BENTO CARD ================= */}
      <div className="glass-panel p-4 sm:p-6 md:p-8 rounded-3xl relative overflow-hidden space-y-5 lg:space-y-0 lg:flex lg:items-start lg:gap-8 w-full">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle,rgba(229,9,20,0.12)_0%,transparent_70%)] pointer-events-none" />

        {/* Mobile Top View: Centered Avatar + Name + Tag + Member Since */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 lg:block lg:shrink-0 relative z-10 w-full lg:w-auto">
          <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden shadow-2xl border border-white/20 mx-auto sm:mx-0">
            <Avatar username={profileUser.username} url={profileUser.avatar_url} className="w-full h-full" />
          </div>

          <div className="min-w-0 flex-1 lg:hidden space-y-1.5 flex flex-col items-center sm:items-start text-center sm:text-left w-full">
            <h1 className="text-xl sm:text-2xl font-display font-black text-white truncate tracking-tight">
              {profileUser.display_name || profileUser.username}
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-block text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#e50914]/15 text-[#ff4d5a] border border-[#e50914]/30">
                @{profileUser.username}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Joined {new Date(profileUser.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Main Bio Column */}
        <div className="flex-1 space-y-4 min-w-0 relative z-10 w-full text-center sm:text-left">
          <div className="hidden lg:flex lg:items-center lg:gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
              {profileUser.display_name || profileUser.username}
            </h1>
            <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-[#e50914]/15 text-[#ff4d5a] border border-[#e50914]/30">
              @{profileUser.username}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono ml-auto">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Joined {new Date(profileUser.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
            </div>
          </div>

          {/* Bio text */}
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            {profileUser.bio || 'Curating films and recording reviews on PlotHole.'}
          </p>

          {/* Responsive 4-Stat Metric Pill Grid (2x2 on Mobile, 4x1 on sm+) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full">
            <div className="bg-white/6 border border-white/8 p-2.5 sm:p-3 rounded-2xl text-center relative group">
              <div className="absolute inset-0 z-10" title="Estimated based on average film runtime (2.1h) + time spent writing reviews (0.4h)" />
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold truncate">Watch Time</span>
              <span className="font-mono font-bold text-sm sm:text-base text-[#ffb800]">{hoursWasted.toFixed(0)}h</span>
            </div>
            <div className="bg-white/6 border border-white/8 p-2.5 sm:p-3 rounded-2xl text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold truncate">Films</span>
              <span className="font-mono font-bold text-sm sm:text-base text-white">{uniqueDiary.length}</span>
            </div>
            <div className="bg-white/6 border border-white/8 p-2.5 sm:p-3 rounded-2xl text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold truncate">Reviews</span>
              <span className="font-mono font-bold text-sm sm:text-base text-[#ff4d5a]">{stats?.reviews || 0}</span>
            </div>
            <div className="bg-white/6 border border-white/8 p-2.5 sm:p-3 rounded-2xl text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold truncate">Followers</span>
              <span className="font-mono font-bold text-sm sm:text-base text-amber-400">{stats?.followers || 0}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center sm:justify-start gap-2.5 pt-1 w-full">
            {!isOwnProfile && currentUser && (
              <button
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
                className={isFollowing ? 'btn-secondary text-xs px-4 py-2.5 w-full sm:w-auto font-display font-bold uppercase tracking-wider' : 'glass-btn-red text-xs px-5 py-2.5 w-full sm:w-auto font-display font-bold uppercase tracking-wider rounded-2xl'}
              >
                {isFollowing ? 'Unfollow' : 'Follow Cinephile'}
              </button>
            )}

            {isOwnProfile && (
              <>
                <button onClick={openEditModal} className="glass-btn-red text-xs px-4.5 py-2.5 rounded-2xl flex items-center justify-center gap-1.5 font-display font-bold uppercase tracking-wider shadow-md cursor-pointer w-full sm:w-auto">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>

                <button onClick={handleExportData} className="px-4.5 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 text-slate-200 hover:text-white bg-white/6 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors font-display font-bold uppercase tracking-wider w-full sm:w-auto">
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Archive</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Rating Distribution Histogram Bento Card */}
        <div className="glass-card p-3.5 sm:p-4 rounded-3xl w-full lg:w-60 space-y-2 shrink-0 relative z-10 mx-auto lg:mx-0">
          <span className="text-[10px] sm:text-[11px] font-mono font-bold text-[#ff4d5a] uppercase block border-b border-white/8 pb-1.5 text-center sm:text-left">
            Rating Distribution
          </span>

          <div className="flex items-end justify-between h-16 sm:h-20 gap-1.5 pt-1 px-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const count = distMap[star] || 0;
              const heightPct = Math.max(15, Math.round((count / maxCount) * 100));
              return (
                <div key={star} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    className="w-full bg-gradient-to-t from-[#b80710] to-[#e50914] rounded-t-md transition-all hover:bg-[#ff3b47]"
                    style={{ height: `${heightPct}%` }}
                    title={`${count} films rated ${star} stars`}
                  />
                  <span className="text-[9px] font-mono text-slate-400 font-bold">{star}★</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= CINEPHILE BADGES SHOWCASE ================= */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 text-center sm:text-left">
          Cinephile Badges & Milestones
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className={`p-3 sm:p-4 rounded-2xl flex items-center gap-2.5 sm:gap-3 transition-all ${
                  b.unlocked
                    ? 'glass-card border-[#e50914]/40 text-slate-100 shadow-[0_2px_14px_rgba(229,9,20,0.15)]'
                    : 'glass-card opacity-60 text-slate-400'
                }`}
              >
                <div className={`p-2 rounded-xl border shrink-0 ${b.unlocked ? 'bg-[#e50914]/20 text-[#ff4d5a] border-[#e50914]/40 shadow-inner' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-display font-bold text-xs block truncate text-slate-200">{b.title}</span>
                  <span className="font-mono text-[9px] sm:text-[10px] text-slate-400 block truncate">{b.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= PINNED REEL DISCOVERIES ================= */}
      {topMovieIds.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 text-center sm:text-left">
            Pinned Reel Discoveries
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-4 pt-0.5 justify-center justify-items-center">
            {topMovieIds.map((mId, idx) => (
              <PolaroidCard key={mId} movieId={mId} angle={rotations[idx % rotations.length]} />
            ))}
          </div>
        </div>
      )}

      {/* ================= AICANVAS REALISTIC LIQUID GLASS TAB BAR ================= */}
      <div className="w-full overflow-x-auto scrollbar-none flex justify-center sm:justify-start">
        <GlassTabBar
          tabs={[
            { id: 'diary', label: 'Diary', icon: Film, count: uniqueDiary.length },
            { id: 'reviews', label: 'Reviews', icon: MessageSquare, count: reviews.length },
            { id: 'lists', label: 'Lists', icon: FolderPlus, count: userLists.length },
            ...(isOwnProfile ? [{ id: 'watchlist', label: 'Watchlist', icon: Bookmark, count: watchlist.length }] : [])
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="w-full sm:w-fit"
        />
      </div>

      {/* ================= TAB CONTENTS ================= */}
      <div>
        {/* Diary Tab */}
        {activeTab === 'diary' && (
          <div>
            {diaryLoading ? (
              <div className="p-12 text-center text-xs font-mono text-slate-400 animate-pulse">LOADING DIARY TIMELINE...</div>
            ) : uniqueDiary.length === 0 ? (
              <div className="glass-panel p-8 rounded-3xl text-center text-slate-400 text-xs font-mono">
                Diary timeline is currently empty.
              </div>
            ) : (
              <>
                {/* Mobile Screen (< md): Rich Responsive Cards */}
                <div className="block md:hidden space-y-3">
                  {uniqueDiary.map((entry) => (
                    <DiaryMobileCard key={entry.id} entry={entry} />
                  ))}
                </div>

                {/* Desktop Screen (>= md): Full Data Table */}
                <div className="hidden md:block glass-panel rounded-3xl overflow-hidden shadow-2xl">
                  <table className="w-full text-xs text-left border-collapse font-sans">
                    <thead>
                      <tr className="bg-white/5 text-slate-300 font-mono uppercase text-[11px] border-b border-white/8">
                        <th className="px-6 py-4">Watched Date</th>
                        <th className="px-6 py-4">Movie</th>
                        <th className="px-6 py-4">Rating</th>
                        <th className="px-6 py-4">Review Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {uniqueDiary.map((entry) => (
                        <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-mono text-slate-400 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#ffb800]" />
                            <span>{entry.watched_date}</span>
                          </td>
                          <td className="px-6 py-4 font-display font-bold text-slate-100">
                            <MovieNameLink movieId={entry.tmdb_movie_id} className="hover:text-[#e50914] transition-colors" />
                          </td>
                          <td className="px-6 py-4">
                            <RatingBadge rating={entry.rating} size="xs" />
                          </td>
                          <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{entry.review_text || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            {reviewsLoading ? (
              <div className="p-12 text-center text-xs font-mono text-slate-400 animate-pulse">LOADING USER REVIEWS...</div>
            ) : reviews.length === 0 ? (
              <div className="glass-panel p-8 rounded-3xl text-center text-slate-400 text-xs font-mono">
                No user reviews written yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((rev) => (
                  <GlassCard key={rev.id} className="p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-white/8 pb-3 gap-2">
                      <MovieNameLink movieId={rev.tmdb_movie_id} className="font-display font-bold text-sm text-slate-100 hover:text-[#ff4d5a] transition-colors line-clamp-1 truncate" />
                      <RatingBadge rating={rev.rating} size="xs" />
                    </div>
                    {rev.review_text && (
                      <p className="text-xs text-slate-300 italic font-sans leading-relaxed bg-black/40 p-3 rounded-xl border border-white/6">
                        "{rev.review_text}"
                      </p>
                    )}
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Logged {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Custom Lists Tab */}
        {activeTab === 'lists' && (
          <div>
            {listsLoading ? (
              <div className="p-12 text-center text-xs animate-pulse font-mono text-slate-400">LOADING CUSTOM LISTS...</div>
            ) : userLists.length === 0 ? (
              <div className="glass-panel p-8 rounded-3xl text-center text-slate-400 text-xs font-mono">
                No custom lists created yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userLists.map((lst) => (
                  <GlassCard key={lst.id} className="p-5 space-y-3 rounded-2xl flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#e50914]/15 text-[#ff4d5a] border border-[#e50914]/30 text-[10px] font-mono uppercase font-semibold">
                        Collection
                      </span>
                      <Link to={`/lists/${lst.id}`}>
                        <h4 className="font-display font-bold text-sm text-slate-100 hover:text-[#ff4d5a] transition-colors leading-tight pt-1">
                          {lst.title}
                        </h4>
                      </Link>
                      <p className="text-xs text-slate-400 font-sans line-clamp-2">{lst.description || 'No description provided.'}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 pt-2 border-t border-white/8 block">
                      {lst.item_count || 0} Films Stored
                    </span>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Watchlist Tab */}
        {activeTab === 'watchlist' && isOwnProfile && (
          <div>
            {watchlistLoading ? (
              <div className="p-12 text-center text-xs font-mono text-slate-400 animate-pulse">LOADING WATCHLIST...</div>
            ) : watchlist.length === 0 ? (
              <div className="glass-panel p-8 rounded-3xl text-center text-slate-400 text-xs font-mono">
                Watchlist is empty. Explore movies and click bookmark to add!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {watchlist.map((item) => (
                  <div key={item.id} className="relative group">
                    <MovieCard movie={{ id: item.tmdb_movie_id, title: `Film #${item.tmdb_movie_id}`, media_type: 'movie' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal with GlassModal */}
      <GlassModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Cinephile Passport"
        subtitle="Update your public critic avatar and cinema bio."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {editError && <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-xl text-xs">{editError}</div>}

          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border border-white/20 shrink-0">
              <Avatar username={profileUser.username} url={editAvatar} className="w-full h-full" />
              <label htmlFor="avatar-file-input" className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-5 h-5 text-white" />
              </label>
            </div>
            <input id="avatar-file-input" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            <button type="button" onClick={() => document.getElementById('avatar-file-input').click()} className="btn-secondary px-3.5 py-1.5 text-xs">
              Change Avatar
            </button>
          </div>

          <div>
            <label className="block font-mono font-bold uppercase tracking-wider text-[11px] text-slate-300 mb-1.5">
              Personal Biography
            </label>
            <textarea
              rows={3}
              maxLength={250}
              required
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="w-full p-3.5 bg-black/40 border border-white/10 rounded-xl text-slate-100 font-sans text-xs focus:outline-none focus:border-[#e50914]/70 leading-relaxed transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-secondary px-4 py-2 text-xs">Cancel</button>
            <button type="submit" disabled={isSaving} className="btn-primary px-6 py-2 text-xs font-bold shadow-md">
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}

function MovieNameLink({ movieId, className = '' }) {
  const { data: movie } = useQuery({
    queryKey: ['movieDetailsSimple', movieId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/movies/${movieId}`);
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 1000 * 60 * 10
  });

  const title = movie?.title || movie?.name || `Film #${movieId}`;
  const mediaType = movie?.media_type || 'movie';

  return (
    <Link to={`/media/${mediaType}/${movieId}`} className={className}>
      {title}
    </Link>
  );
}
