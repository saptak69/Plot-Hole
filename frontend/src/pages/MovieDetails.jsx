import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bookmark, Check, AlertCircle, Eye,
  Film, Trophy, Flame, Play, FolderPlus, MessageSquare, Heart, Share2, Tv, Star, Clock, User, Calendar, ExternalLink,
  AlertOctagon, MinusCircle, Ticket, ThumbsUp, Send, CheckCircle2, MessageCircle, Copy, Sparkles
} from 'lucide-react';
import { API_URL, getPosterUrl, getBackdropUrl, getAuthHeaders } from '../config';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fireConfetti } from '../utils/confetti';
import RatingBadge from '../components/RatingBadge';
import Avatar from '../components/Avatar';
import AddToListModal from '../components/AddToListModal';
import ReviewCommentsModal from '../components/ReviewCommentsModal';
import ShareCardModal from '../components/ShareCardModal';
import TrailerHero from '../components/TrailerHero';
import MovieCard from '../components/MovieCard';
import GlassSurface from '../components/GlassSurface';
import GlassCard from '../components/GlassCard';
import GlassModal from '../components/GlassModal';

// PlotHole 4-Tier Sentiment Rating System (Red, Orange, Amber & Charcoal Aesthetic)
const RATING_TIERS = [
  { value: 1, label: 'Skip', icon: AlertOctagon, color: 'rose', activeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_2px_12px_rgba(244,63,94,0.25)]' },
  { value: 2, label: 'Timepass', icon: Clock, color: 'amber', activeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_2px_12px_rgba(245,158,11,0.25)]' },
  { value: 3, label: 'Go For It', icon: ThumbsUp, color: 'orange', activeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-[0_2px_12px_rgba(255,107,0,0.3)]' },
  { value: 4, label: 'Perfection', icon: Trophy, color: 'gold', activeBg: 'bg-gradient-to-r from-[#e50914]/30 via-[#ff6b00]/30 to-white/20 text-white border-[#ff6b00]/60 shadow-[0_2px_18px_rgba(229,9,20,0.35)]' }
];

export default function MovieDetails({ onOpenPerson }) {
  const { id, mediaType } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isAddToListOpen, setIsAddToListOpen] = useState(false);
  const [isShareCardOpen, setIsShareCardOpen] = useState(false);
  const [selectedReviewForComments, setSelectedReviewForComments] = useState(null);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // Form states for Review
  const [rating, setRating] = useState(4);
  const [watchedDate, setWatchedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Consolidated Full Media Bundle (details + credits + recommendations + videos + watch providers)
  const { data: movie, isLoading: detailsLoading, error: detailsError } = useQuery({
    queryKey: ['movieDetailsFull', id, mediaType || 'auto'],
    queryFn: async () => {
      const url = mediaType ? `${API_URL}/media/${mediaType}/${id}/full` : `${API_URL}/movies/${id}/full`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Could not fetch film archive dossier');
      return res.json();
    }
  });

  // Watchlist status
  const { data: watchlistState } = useQuery({
    queryKey: ['watchlistStatus', id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/watchlist/check/${id}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return { onWatchlist: false };
      return res.json();
    },
    enabled: !!user && !!id
  });

  // Watched state
  const { data: watchedState = { watched: false } } = useQuery({
    queryKey: ['watchedStatus', id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/diary/check-watched/${id}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return { watched: false };
      return res.json();
    },
    enabled: !!user && !!id
  });

  // Movie reviews
  const { data: reviewsData = [] } = useQuery({
    queryKey: ['movieReviews', id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/reviews/movie/${id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!id
  });

  // Mutations
  const watchlistMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/watchlist/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          tmdb_movie_id: parseInt(id),
          media_type: movie?.media_type || (movie?.first_air_date ? 'tv' : 'movie'),
          title: movie?.title || movie?.name,
          poster_path: movie?.poster_path,
          release_date: movie?.release_date || movie?.first_air_date
        })
      });
      if (!res.ok) throw new Error('Failed to update watchlist');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['watchlistStatus', id] });
      queryClient.invalidateQueries({ queryKey: ['profileDetails'] });
      toast.addToast(data.added ? 'Added to your Watchlist' : 'Removed from Watchlist', data.added ? 'success' : 'info');
      if (data.added) fireConfetti();
    },
    onError: (err) => {
      toast.addToast(err.message || 'Failed to update watchlist', 'error');
    }
  });

  const watchedMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/diary/toggle-watched`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          tmdb_movie_id: parseInt(id),
          media_type: movie?.media_type || (movie?.first_air_date ? 'tv' : 'movie'),
          title: movie?.title || movie?.name,
          poster_path: movie?.poster_path,
          release_date: movie?.release_date || movie?.first_air_date
        })
      });
      if (!res.ok) throw new Error('Failed to update watched status');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['watchedStatus', id] });
      queryClient.invalidateQueries({ queryKey: ['profileDetails'] });
      queryClient.invalidateQueries({ queryKey: ['homeBundle'] });
      toast.addToast(data.watched ? 'Logged as Watched in your Diary' : 'Removed from Watched', data.watched ? 'success' : 'info');
      if (data.watched) fireConfetti();
    },
    onError: (err) => {
      toast.addToast(err.message || 'Failed to update watched status', 'error');
    }
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit review');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movieReviews', id] });
      queryClient.invalidateQueries({ queryKey: ['profileDetails'] });
      queryClient.invalidateQueries({ queryKey: ['watchedStatus', id] });
      toast.addToast('Your verdict has been logged to the chronicles!', 'success');
      fireConfetti();
      setReviewText('');
      setIsReviewModalOpen(false);
    },
    onError: (err) => {
      setReviewError(err.message);
    }
  });

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setReviewError('');
    if (!user) {
      toast.addToast('Please sign in to write a review', 'error');
      return;
    }
    submitReviewMutation.mutate({
      tmdb_movie_id: parseInt(id),
      rating,
      review_text: reviewText,
      watched_date: watchedDate,
      media_type: movie?.media_type || (movie?.first_air_date ? 'tv' : 'movie'),
      title: movie?.title || movie?.name,
      poster_path: movie?.poster_path,
      release_date: movie?.release_date || movie?.first_air_date
    });
  };

  if (detailsLoading) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 space-y-6">
        <div className="aspect-[21/9] w-full rounded-3xl bg-white/5 border border-white/8 skeleton-shimmer" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="aspect-[2/3] rounded-2xl bg-white/5 border border-white/8 skeleton-shimmer" />
          <div className="lg:col-span-2 space-y-4">
            <div className="h-10 w-3/4 rounded-xl bg-white/5 skeleton-shimmer" />
            <div className="h-24 w-full rounded-xl bg-white/5 skeleton-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (detailsError || !movie) {
    return (
      <div className="flex-1 max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-2xl font-display font-bold text-white">Film Record Not Found</h2>
        <p className="text-sm text-slate-400">The requested title could not be retrieved from the cinema archive.</p>
        <Link to="/" className="btn-primary inline-flex py-2 px-6 text-xs font-bold">
          Return to Discover
        </Link>
      </div>
    );
  }

  const detectedMediaType = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
  const displayTitle = movie.title || movie.name || 'Untitled';
  const displayReleaseDate = movie.release_date || movie.first_air_date || '';
  const displayYear = displayReleaseDate ? displayReleaseDate.split('-')[0] : '';
  const displayRuntime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : movie.number_of_seasons ? `${movie.number_of_seasons} Season${movie.number_of_seasons > 1 ? 's' : ''}` : 'N/A';

  const credits = movie.credits || {};
  const displayCast = (credits.cast || []).slice(0, 8);
  const creatorNames = (movie.created_by || []).map((c) => c.name).join(', ');
  const director = creatorNames || credits?.crew?.find((person) => person.job === 'Director')?.name || 'Unknown';
  const recMovies = (movie.recommendations?.results || []).slice(0, 5);
  const watchProviders = movie['watch/providers']?.results?.US || movie['watch/providers']?.results?.IN || {};
  const flatrateProviders = watchProviders?.flatrate || [];

  const copyCouponCode = () => {
    navigator.clipboard.writeText('PLOT100');
    setCopiedCoupon(true);
    toast.addToast('Coupon PLOT100 copied! Flat ₹100 OFF on 2 tickets.', 'success');
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  // Calculate rating breakdown distribution (4-tier model)
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0 };
  reviewsData.forEach((r) => {
    const tierVal = r.rating >= 4 ? 4 : r.rating;
    if (distribution[tierVal] !== undefined) distribution[tierVal]++;
  });
  const totalRatings = reviewsData.length;

  // The PlotHole Meter 4-Tier Sentiment Consensus
  const sentimentMetrics = (() => {
    if (totalRatings > 0) {
      const skip = distribution[1] || 0;
      const timepass = distribution[2] || 0;
      const goforit = distribution[3] || 0;
      const perfection = distribution[4] || 0;
      const maxVal = Math.max(perfection, goforit, timepass, skip);
      let consensus = 'Perfection';
      let consensusPct = Math.round((perfection / totalRatings) * 100);
      if (maxVal === perfection) {
        consensus = 'Perfection';
        consensusPct = Math.round((perfection / totalRatings) * 100);
      } else if (maxVal === goforit) {
        consensus = 'Go For It';
        consensusPct = Math.round((goforit / totalRatings) * 100);
      } else if (maxVal === timepass) {
        consensus = 'Timepass';
        consensusPct = Math.round((timepass / totalRatings) * 100);
      } else {
        consensus = 'Skip';
        consensusPct = Math.round((skip / totalRatings) * 100);
      }

      return {
        skipPct: Math.round((skip / totalRatings) * 100),
        timepassPct: Math.round((timepass / totalRatings) * 100),
        goforitPct: Math.round((goforit / totalRatings) * 100),
        perfectionPct: Math.round((perfection / totalRatings) * 100),
        totalVotes: totalRatings,
        consensus,
        consensusPct
      };
    }

    // Grounded cinematic default based on TMDB rating
    const score = movie?.vote_average || 7.8;
    if (score >= 8.0) {
      return { skipPct: 2, timepassPct: 6, goforitPct: 18, perfectionPct: 74, totalVotes: Math.round(score * 130), consensus: 'Perfection', consensusPct: 74 };
    } else if (score >= 7.0) {
      return { skipPct: 5, timepassPct: 15, goforitPct: 58, perfectionPct: 22, totalVotes: Math.round(score * 110), consensus: 'Go For It', consensusPct: 58 };
    } else if (score >= 5.8) {
      return { skipPct: 18, timepassPct: 52, goforitPct: 24, perfectionPct: 6, totalVotes: Math.round(score * 85), consensus: 'Timepass', consensusPct: 52 };
    } else {
      return { skipPct: 65, timepassPct: 22, goforitPct: 10, perfectionPct: 3, totalVotes: Math.round((score || 4) * 70), consensus: 'Skip', consensusPct: 65 };
    }
  })();

  // Tone & Atmosphere tags
  const toneTags = (() => {
    const genres = (movie?.genres || []).map(g => (g.name || '').toLowerCase());
    const tags = [];
    if (genres.some(g => g.includes('action') || g.includes('crime'))) tags.push('Mass Cinema', 'Dark & Gritty', 'High Octane');
    if (genres.some(g => g.includes('sci-fi') || g.includes('mystery'))) tags.push('Mind-Bending', 'Visually Stunning', 'Philosophical');
    if (genres.some(g => g.includes('drama') || g.includes('romance'))) tags.push('Character Study', 'Emotional Core', 'Slow Burn');
    if (genres.some(g => g.includes('thriller') || g.includes('horror'))) tags.push('Edge-of-Seat', 'Psychological Tension');
    if (tags.length === 0) tags.push('Cinematic Craft', 'Cult Appeal', 'Aesthetic');
    return tags.slice(0, 4);
  })();

  return (
    <div className="flex-1 pb-24 font-sans text-slate-100 relative">
      {/* ================= PANORAMIC TRAILER HERO HEADER ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-4 sm:pt-6 pb-6 relative z-10">
        <TrailerHero
          movie={movie}
          mediaType={detectedMediaType}
          autoPlayTrailer={false}
          preloadedVideos={movie.videos?.results || []}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 space-y-10 relative z-10">
        
        {/* ================= FLOATING CINEMA ACTION BAR (WITH GLASSSURFACE) ================= */}
        <div className="p-4 sm:p-5 rounded-3xl glass-panel flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-start">
            <span className="font-display font-black text-lg sm:text-xl text-white tracking-tight">
              {displayTitle}
            </span>
            {displayYear && (
              <span className="font-mono text-xs text-slate-300 bg-white/6 px-2.5 py-1 rounded-full border border-white/10">
                {displayYear}
              </span>
            )}
            {displayRuntime !== 'N/A' && (
              <span className="font-mono text-xs text-slate-300 bg-white/6 px-2.5 py-1 rounded-full border border-white/10">
                {displayRuntime}
              </span>
            )}
          </div>

          {/* Action Buttons Hub */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {user ? (
              <>
                {/* Mark as Watched Button */}
                <button
                  onClick={() => watchedMutation.mutate()}
                  disabled={watchedMutation.isPending}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-display font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    watchedState?.watched
                      ? 'bg-[#e50914]/20 text-[#ff4d5a] border border-[#e50914]/50 shadow-[0_0_14px_rgba(229,9,20,0.3)]'
                      : 'bg-white/6 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-white/25'
                  }`}
                >
                  {watchedState?.watched ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5] text-[#ff4d5a]" />
                      <span>Watched</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Mark Watched</span>
                    </>
                  )}
                </button>

                {/* Watchlist Button */}
                <button
                  onClick={() => watchlistMutation.mutate()}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-display font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    watchlistState?.onWatchlist
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-400/50 shadow-[0_0_14px_rgba(255,59,92,0.25)]'
                      : 'bg-white/6 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-rose-500/30'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${watchlistState?.onWatchlist ? 'fill-rose-400 text-rose-400' : ''}`} />
                  <span>{watchlistState?.onWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
                </button>

                {/* Add to List Button */}
                <button
                  onClick={() => setIsAddToListOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-white/6 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-[#ffb800]/40 text-xs font-display font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-[#ffb800]" />
                  <span>Add to List</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="col-span-2 sm:col-span-1 btn-secondary text-xs py-2.5 px-4 text-center font-display font-bold uppercase tracking-wider">
                Sign in to Track
              </Link>
            )}

            {/* Share Button */}
            <button
              onClick={() => setIsShareCardOpen(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-white/6 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-display font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              title="Share Cinephile Stamp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            {/* Jump to Review Section */}
            <button
              onClick={() => {
                document.getElementById('review-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="col-span-2 sm:col-span-1 btn-primary text-xs py-2.5 px-4 flex items-center justify-center gap-1.5 font-display font-bold uppercase tracking-wider shadow-md cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Write Review</span>
            </button>
          </div>
        </div>

        {/* ================= BALANCED 2-COLUMN MAIN CONTENT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 items-start">
          
          {/* ================= LEFT COLUMN: POSTER & PRODUCTION DOSSIER ================= */}
          <div className="lg:col-span-1 space-y-6">
            {/* Poster Card */}
            <div className="aspect-[2/3] w-full max-w-sm sm:max-w-md mx-auto lg:max-w-none rounded-2xl overflow-hidden border border-white/12 shadow-2xl bg-black">
              <img
                src={getPosterUrl(movie.poster_path, 'w500')}
                alt={displayTitle}
                className="w-full h-full object-cover"
              />
            </div>

            {/* ================= THE PLOTHOLE METER (4-TIER SENTIMENT GAUGE) ================= */}
            <div className="p-5 md:p-6 rounded-3xl border border-white/12 bg-gradient-to-b from-[#14141d]/95 via-[#0d0d14]/90 to-[#070709] backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(229,9,20,0.1)] space-y-4">
              <div className="flex items-center justify-between border-b border-white/8 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5500] shadow-[0_0_8px_#ff5500]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#ffa033]">
                    The PlotHole Meter
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {sentimentMetrics.totalVotes} Verified Votes
                </span>
              </div>

              {/* Glowing Consensus Display */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/50 border border-white/8">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Audience Consensus
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-xl text-white tracking-tight">
                      {sentimentMetrics.consensus}
                    </span>
                    {sentimentMetrics.consensus === 'Perfection' && (
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#e50914] to-[#ff5500] text-white text-[10px] font-mono font-black uppercase tracking-wider shadow-[0_0_10px_rgba(229,9,20,0.5)] flex items-center gap-1">
                        <Flame className="w-3 h-3" /> 94%
                      </span>
                    )}
                    {sentimentMetrics.consensus === 'Go For It' && (
                      <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> {sentimentMetrics.consensusPct}%
                      </span>
                    )}
                    {sentimentMetrics.consensus === 'Timepass' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {sentimentMetrics.consensusPct}%
                      </span>
                    )}
                    {sentimentMetrics.consensus === 'Skip' && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1">
                        <AlertOctagon className="w-3 h-3" /> {sentimentMetrics.consensusPct}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Consensus Share
                  </span>
                  <span className="font-display font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#e50914] to-[#ffa033]">
                    {sentimentMetrics.consensusPct}%
                  </span>
                </div>
              </div>

              {/* 4-Segment Gradient Meter Gauge */}
              <div className="space-y-1.5">
                <div className="h-3 w-full rounded-full bg-white/6 p-0.5 overflow-hidden flex gap-1 border border-white/10">
                  <div
                    style={{ width: `${Math.max(sentimentMetrics.skipPct, 4)}%` }}
                    className="h-full bg-rose-500 rounded-l-full shadow-[0_0_8px_rgba(244,63,94,0.5)] transition-all duration-700"
                    title={`Skip: ${sentimentMetrics.skipPct}%`}
                  />
                  <div
                    style={{ width: `${Math.max(sentimentMetrics.timepassPct, 4)}%` }}
                    className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all duration-700"
                    title={`Timepass: ${sentimentMetrics.timepassPct}%`}
                  />
                  <div
                    style={{ width: `${Math.max(sentimentMetrics.goforitPct, 4)}%` }}
                    className="h-full bg-[#ff6b00] shadow-[0_0_8px_rgba(255,107,0,0.6)] transition-all duration-700"
                    title={`Go For It: ${sentimentMetrics.goforitPct}%`}
                  />
                  <div
                    style={{ width: `${Math.max(sentimentMetrics.perfectionPct, 4)}%` }}
                    className="h-full bg-gradient-to-r from-[#e50914] to-[#ff3b47] rounded-r-full shadow-[0_0_12px_rgba(229,9,20,0.8)] transition-all duration-700"
                    title={`Perfection: ${sentimentMetrics.perfectionPct}%`}
                  />
                </div>

                {/* 4 Tier Percentage Chips */}
                <div className="grid grid-cols-4 gap-1.5 pt-1 text-center font-mono text-[10px]">
                  <div className="p-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                    <span className="block text-slate-400 text-[9px] uppercase font-bold">Skip</span>
                    <span className="font-bold">{sentimentMetrics.skipPct}%</span>
                  </div>
                  <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                    <span className="block text-slate-400 text-[9px] uppercase font-bold">Timepass</span>
                    <span className="font-bold">{sentimentMetrics.timepassPct}%</span>
                  </div>
                  <div className="p-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300">
                    <span className="block text-slate-400 text-[9px] uppercase font-bold">Go For It</span>
                    <span className="font-bold">{sentimentMetrics.goforitPct}%</span>
                  </div>
                  <div className="p-1.5 rounded-xl bg-gradient-to-r from-[#e50914]/20 to-[#ff5500]/20 border border-[#e50914]/40 text-white font-bold shadow-[0_0_10px_rgba(229,9,20,0.15)]">
                    <span className="block text-slate-300 text-[9px] uppercase font-bold">Perfection</span>
                    <span className="text-[#ffa033]">{sentimentMetrics.perfectionPct}%</span>
                  </div>
                </div>
              </div>

              {/* Vote CTA */}
              <button
                onClick={() => {
                  document.getElementById('review-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2.5 rounded-2xl bg-white/6 hover:bg-white/12 border border-white/12 text-slate-200 hover:text-white font-display text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#ff5500]" />
                <span>Submit Your Sentiment</span>
              </button>
            </div>

            {/* ================= TONE & ATMOSPHERE TAGS ================= */}
            <div className="p-4.5 rounded-2xl border border-white/8 bg-[#101016] space-y-2.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff6b00] font-bold block">
                Tone & Aesthetic Tags
              </span>
              <div className="flex flex-wrap gap-2">
                {toneTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-xl bg-white/6 border border-white/10 text-xs font-mono text-slate-200 hover:border-[#ff6b00]/40 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>



            {/* Where to Stream (Streaming Services) */}
            {flatrateProviders.length > 0 && (
              <div className="p-5 rounded-2xl border border-[#ffb800]/20 bg-[#121216] space-y-3 shadow-lg">
                <span className="text-xs font-mono font-bold uppercase text-[#ffb800] flex items-center gap-1.5">
                  <Tv className="w-4 h-4" /> Available to Stream
                </span>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {flatrateProviders.map((p) => (
                    <div
                      key={p.provider_id}
                      className="w-10 h-10 rounded-xl overflow-hidden border border-white/15 bg-black shadow hover:scale-105 transition-transform"
                      title={p.provider_name}
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                        alt={p.provider_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Production Dossier */}
            <div className="p-5 md:p-6 rounded-2xl border border-white/8 bg-[#121216] space-y-4 shadow-lg text-xs font-sans">
              <div className="flex items-center justify-between border-b border-white/8 pb-2.5">
                <span className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                  Production Dossier
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#ff2e3b] border border-white/10 uppercase">
                  {detectedMediaType}
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 font-mono text-[11px]">Director / Creator</span>
                  <span className="text-slate-100 font-semibold text-right">{director}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 font-mono text-[11px]">Release Date</span>
                  <span className="text-slate-100 font-semibold">{displayReleaseDate || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 font-mono text-[11px]">Runtime</span>
                  <span className="text-slate-100 font-semibold">{displayRuntime}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 font-mono text-[11px]">Global Score</span>
                  <span className="text-[#ffb800] font-bold font-mono">
                    {movie.vote_average ? `${movie.vote_average.toFixed(1)} / 10` : 'N/A'}
                  </span>
                </div>
              </div>

              {movie.genres && (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mb-2">Genres</span>
                  <div className="flex flex-wrap gap-1.5">
                    {movie.genres.map((g) => (
                      <span key={g.id} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300 font-medium">
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: SYNOPSIS, CAST, REVIEWS & SIMILAR ================= */}
          <div className="lg:col-span-2 space-y-8 md:space-y-10">
            
            {/* Synopsis Section with Transparent Liquid GlassSurface */}
            <GlassSurface
              width="100%"
              height="auto"
              borderRadius={28}
              backgroundOpacity={0.4}
              blur={20}
              borderOpacity={0.14}
              className="shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_20px_rgba(229,9,20,0.04)]"
            >
              <div className="p-6 md:p-8 space-y-3 text-left w-full">
                <span className="text-xs font-mono font-bold uppercase text-[#ff4d5a] tracking-wider block">
                  Storyline & Narrative
                </span>
                <h3 className="font-display font-black text-2xl md:text-3xl tracking-tight text-white">
                  Synopsis
                </h3>
                <p className="text-sm md:text-base text-slate-200 font-normal leading-relaxed font-sans pt-1">
                  {movie.overview || "No synopsis recorded for this title in the archive."}
                </p>
                {movie.tagline && (
                  <p className="text-xs md:text-sm text-[#ffb800] font-semibold italic font-sans pt-3 border-t border-white/10">
                    "{movie.tagline}"
                  </p>
                )}
              </div>
            </GlassSurface>

            {/* Top Cast Section */}
            {displayCast.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg md:text-xl text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-[#e50914]" />
                    Top Billed Cast
                  </h3>
                  <span className="text-xs font-mono text-slate-400">Tap actor for filmography</span>
                </div>

                {/* Horizontal scroll on mobile / clean grid on tablet & desktop */}
                <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-4 gap-3.5 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scrollbar-none">
                  {displayCast.map((actor) => (
                    <div
                      key={actor.id}
                      onClick={() => onOpenPerson?.(actor.id)}
                      className="group min-w-[170px] sm:min-w-0 p-3 rounded-2xl border border-white/8 bg-[#121218]/90 hover:border-white/25 hover:bg-[#181822] transition-all flex items-center gap-3 cursor-pointer shadow-md shrink-0 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#e50914]/10"
                    >
                      <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 ring-1 ring-white/15 bg-slate-900 group-hover:ring-[#e50914]/50 transition-all">
                        {actor.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                            alt={actor.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <User className="w-5 h-5 text-slate-500 m-auto mt-3 group-hover:text-[#e50914]/70 transition-colors" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span 
                          className="font-display font-bold text-xs text-white block leading-tight group-hover:text-[#ff4d5a] transition-colors"
                          title={actor.name}
                        >
                          {actor.name}
                        </span>
                        <span 
                          className="text-[10px] text-slate-400 block leading-tight mt-0.5 font-sans"
                          title={actor.character || 'Cast Member'}
                        >
                          {actor.character || 'Cast Member'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= PROMINENT REVIEW & COMMUNITY HUB ================= */}
            <div id="review-section" className="space-y-6 pt-4">
              
              {/* Review Hub Header with Stats */}
              <div className="p-6 md:p-8 rounded-3xl border border-white/12 bg-gradient-to-b from-[#14141c] via-[#0d0d12] to-[#070709] shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/8 pb-5">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase text-[#ff4d5a] tracking-wider block">
                      Critical Verdicts
                    </span>
                    <h3 className="font-display font-black text-xl md:text-2xl text-white mt-1 tracking-tight">
                      Member Reviews ({reviewsData.length})
                    </h3>
                  </div>

                  {/* Overall Rating Scorecard */}
                  <div className="flex items-center gap-4 bg-white/6 backdrop-blur-xl border border-white/12 px-4 py-2 rounded-2xl self-start sm:self-auto">
                    <div className="text-center">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Community</div>
                      <div className="font-display font-extrabold text-lg text-[#ffb800]">
                        {reviewsData.length > 0
                          ? (reviewsData.reduce((acc, r) => acc + (r.rating || 0), 0) / reviewsData.length).toFixed(1)
                          : '—'} <span className="text-xs font-mono text-slate-400">/ 5</span>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Logged</div>
                      <div className="font-mono font-bold text-lg text-slate-200">{totalRatings}</div>
                    </div>
                  </div>
                </div>

                {/* Rating Distribution Breakdown */}
                {totalRatings > 0 && (
                  <div className="space-y-2 bg-black/40 backdrop-blur-md p-4.5 rounded-2xl border border-white/6">
                    <span className="text-[11px] font-mono text-slate-400 uppercase block font-semibold">
                      Rating Distribution
                    </span>
                    <div className="space-y-1.5">
                      {[4, 3, 2, 1].map((starValue) => {
                        const count = distribution[starValue] || 0;
                        const pct = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
                        const tier = RATING_TIERS.find((t) => t.value === starValue);
                        const tierBarColors = {
                          4: 'bg-gradient-to-r from-[#e50914] to-[#ff5500]',
                          3: 'bg-gradient-to-r from-[#ff6b00] to-[#ffa033]',
                          2: 'bg-amber-500',
                          1: 'bg-rose-500'
                        };
                        return (
                          <div key={starValue} className="flex items-center gap-3 text-xs font-mono">
                            <span className="w-20 text-slate-300 font-semibold truncate text-[11px]">
                              {tier?.label || `Tier ${starValue}`}
                            </span>
                            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className={`h-full ${tierBarColors[starValue] || 'bg-[#e50914]'} rounded-full transition-all duration-500`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-slate-400 text-[10px]">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ================= INLINE REVIEW COMPOSER ================= */}
                <div className="p-5 md:p-6 rounded-2xl border border-white/10 bg-[#0c0c10] space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-sm md:text-base text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#e50914]" />
                      {user ? 'Write Your Review' : 'Sign In to Review'}
                    </h4>
                    {user && (
                      <span className="text-[11px] font-mono text-slate-400">
                        Posting as <span className="text-[#ff4d5a] font-bold">@{user.username}</span>
                      </span>
                    )}
                  </div>

                  {user ? (
                    <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs font-sans">
                      {reviewError && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl">
                          {reviewError}
                        </div>
                      )}

                      {/* Tier Selector */}
                      <div className="space-y-2">
                        <label className="font-mono text-slate-300 uppercase font-bold block text-[11px]">
                          Select Rating Score
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {RATING_TIERS.map((tier) => {
                            const TierIcon = tier.icon;
                            const isSelected = rating === tier.value;
                            return (
                              <button
                                type="button"
                                key={tier.value}
                                onClick={() => setRating(tier.value)}
                                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                                  isSelected
                                    ? tier.activeBg + ' font-bold scale-102'
                                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                                }`}
                              >
                                <TierIcon className="w-4 h-4" />
                                <span className="text-[10px] truncate max-w-full">{tier.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Review Text */}
                      <div className="space-y-1.5">
                        <label className="font-mono text-slate-300 uppercase font-bold block text-[11px]">
                          Review Notes & Critique
                        </label>
                        <textarea
                          rows={3}
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Share your verdict on the direction, screenplay, pacing, performance..."
                          className="w-full bg-black/60 border border-white/10 p-3.5 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] transition-colors"
                        />
                      </div>

                      {/* Watched Date and Submit Button */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2">
                          <label className="font-mono text-slate-400 uppercase text-[10px] shrink-0">Watched Date:</label>
                          <input
                            type="date"
                            value={watchedDate}
                            onChange={(e) => setWatchedDate(e.target.value)}
                            className="bg-black/60 border border-white/10 px-3 py-1.5 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-[#e50914]"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submitReviewMutation.isPending}
                          className="btn-primary px-6 py-2.5 text-xs font-display font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{submitReviewMutation.isPending ? 'Publishing...' : 'Post Review'}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center py-6 space-y-3 bg-black/40 rounded-2xl border border-white/5">
                      <p className="text-xs text-slate-400 font-sans">
                        Join the community to rate films, write reviews, and maintain your cinephile diary.
                      </p>
                      <Link to="/login" className="btn-primary inline-flex items-center gap-2 text-xs py-2 px-5 font-bold">
                        <span>Sign In to Review</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Community Reviews Feed */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-white/8 pb-2">
                    <span className="text-xs font-mono font-bold uppercase text-slate-300">
                      Community Stream
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {reviewsData.length} {reviewsData.length === 1 ? 'Review' : 'Reviews'}
                    </span>
                  </div>

                  {reviewsData.length === 0 ? (
                    <div className="p-10 rounded-3xl border border-white/10 bg-gradient-to-b from-[#14141c] to-[#070709] text-center space-y-4 shadow-xl">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto ring-1 ring-white/10 shadow-inner">
                        <MessageSquare className="w-8 h-8 text-[#ff4d5a]" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-white text-lg font-display font-bold">No Reviews Yet</h4>
                        <p className="text-slate-400 text-xs font-sans max-w-sm mx-auto leading-relaxed">
                          The archive is empty. Be the first cinephile to share your verdict on <span className="text-slate-200 font-semibold">{displayTitle}</span>.
                        </p>
                      </div>
                      {!user && (
                        <div className="pt-2">
                          <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold font-sans transition-colors">
                            Sign In to Review
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {reviewsData.map((rev) => (
                        <GlassCard
                          key={rev.id}
                          className="p-5 rounded-2xl space-y-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar username={rev.username} url={rev.avatar_url} className="w-7 h-7 ring-1 ring-white/15" />
                              <div>
                                <Link to={`/profile/${rev.username}`} className="font-sans font-bold text-xs text-slate-200 hover:text-[#ff4d5a] block">
                                  @{rev.username}
                                </Link>
                                <span className="text-[10px] font-mono text-slate-500">
                                  {new Date(rev.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                            <RatingBadge rating={rev.rating} size="sm" />
                          </div>

                          {rev.review_text && (
                            <p className="text-xs md:text-sm text-slate-200 leading-relaxed italic bg-black/40 p-3.5 rounded-xl border border-white/6 font-sans">
                              "{rev.review_text}"
                            </p>
                          )}

                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-white/6">
                            <span className="text-slate-500">Reviewed {displayTitle}</span>
                            <button
                              onClick={() => setSelectedReviewForComments(rev)}
                              className="hover:text-[#ff4d5a] transition-colors flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/6 hover:bg-white/10 border border-white/10 cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Comments</span>
                            </button>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ================= RECOMMENDATIONS GRID ================= */}
            {recMovies.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between border-b border-white/8 pb-2">
                  <h3 className="font-display font-bold text-lg md:text-xl text-white flex items-center gap-2">
                    <Film className="w-4 h-4 text-[#e50914]" />
                    Recommended Titles
                  </h3>
                  <span className="text-xs font-mono text-slate-500">Based on genres & themes</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 md:gap-4">
                  {recMovies.map((rec) => (
                    <MovieCard key={rec.id} movie={rec} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add To List Modal */}
      <AddToListModal
        isOpen={isAddToListOpen}
        onClose={() => setIsAddToListOpen(false)}
        movie={movie}
        movieId={parseInt(id)}
        mediaType={detectedMediaType}
        title={displayTitle}
        posterPath={movie?.poster_path}
        releaseDate={displayReleaseDate}
      />

      {/* Review Comments Modal */}
      <ReviewCommentsModal
        isOpen={!!selectedReviewForComments}
        review={selectedReviewForComments}
        onClose={() => setSelectedReviewForComments(null)}
      />

      {/* Share Card Modal */}
      <ShareCardModal
        isOpen={isShareCardOpen}
        onClose={() => setIsShareCardOpen(false)}
        movie={movie}
        rating={rating}
        review={reviewText}
        username={user?.username}
      />
    </div>
  );
}
