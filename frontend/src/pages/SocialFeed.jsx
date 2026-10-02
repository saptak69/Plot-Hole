import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, UserPlus, MessageSquare, Flame, Star, Clock, Film } from 'lucide-react';
import { API_URL, getAuthHeaders, getPosterUrl } from '../config';
import RatingBadge from '../components/RatingBadge';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';

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
      });
    </div>
  );
}

export default function SocialFeed() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [feedMode, setFeedMode] = useState('following');

  // Profile Data
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profileDetails', currentUser?.username],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/users/profile/${currentUser?.username}`);
      if (!res.ok) throw new Error('Failed to load profile');
      return res.json();
    },
    enabled: !!currentUser
  });

  const followingCount = profileData?.stats?.following || 0;

  // Social Feed Data
  const { data: feed = [], isLoading: isFeedLoading, error } = useQuery({
    queryKey: ['socialFeed'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/social/feed`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to load social feed');
      return res.json();
    },
    enabled: !!currentUser
  });

  // Global Reviews Fallback
  const { data: globalReviews = [] } = useQuery({
    queryKey: ['globalStream'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/social/global`);
      if (!res.ok) return [];
      return res.json();
    }
  });

  // Suggestions
  const { data: suggestions = [], isLoading: isSuggestionsLoading } = useQuery({
    queryKey: ['suggestions'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/social/suggestions`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!currentUser
  });

  const followMutation = useMutation({
    mutationFn: async (targetId) => {
      const res = await fetch(`${API_URL}/social/follow/${targetId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to follow user');
      return res.json();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['socialFeed'] });
      queryClient.invalidateQueries({ queryKey: ['profileDetails', currentUser?.username] });
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    }
  });

  const isLoading = isFeedLoading || isProfileLoading || isSuggestionsLoading;
  const activeFeed = feedMode === 'following' ? feed : globalReviews;

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-10 text-left font-sans space-y-6 md:space-y-8">
      {/* Page Header & Feed Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-display font-black text-xl sm:text-2xl md:text-3xl text-text-primary flex items-center gap-2.5">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <span>Community Feed</span>
          </h1>
          <p className="text-xs font-mono text-text-secondary mt-0.5">Live reviews and verdicts from fellow cinephiles</p>
        </div>

        <SimpleTabBar
          tabs={[
            { id: 'following', label: 'Following', icon: Users, count: followingCount },
            { id: 'global', label: 'Global Stream', icon: Flame }
          ]}
          activeTab={feedMode}
          onTabChange={setFeedMode}
          className="self-start sm:self-auto"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-3xl bg-bg-surface border border-border animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 border border-error/30 bg-error/10 text-error rounded-3xl text-xs font-mono">
          [Error loading feed]: {error.message}
        </div>
      ) : feedMode === 'following' && followingCount === 0 ? (
        <div className="space-y-6">
          <div className="bg-bg-elevated border border-border p-6 sm:p-8 text-center text-text-secondary space-y-3 rounded-3xl shadow-sm">
            <Users className="w-9 h-9 text-accent mx-auto" />
            <h3 className="font-display font-black text-lg sm:text-xl text-text-primary tracking-tight">Your Following Feed is Quiet</h3>
            <p className="text-xs sm:text-sm max-w-md mx-auto font-sans leading-relaxed text-text-secondary">
              You aren't following any critics yet! Discover fellow cinephiles below or switch to Global Stream to explore recent community critiques.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            <h3 className="text-xs font-mono font-bold text-text-secondary uppercase flex items-center gap-2 tracking-wider">
              <UserPlus className="w-4 h-4 text-accent" />
              <span>Suggested Cinephiles to Follow</span>
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {suggestions.map((sug) => (
                <SuggestionCard
                  key={sug.id}
                  sug={sug}
                  onFollow={(id) => followMutation.mutate(id)}
                  isPending={followMutation.isPending}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {activeFeed.length === 0 ? (
            <div className="bg-bg-elevated border border-border p-10 text-center text-text-secondary space-y-4 rounded-3xl shadow-sm">
              <Film className="w-10 h-10 text-accent mx-auto opacity-70" />
              <div className="space-y-1">
                <h3 className="font-display font-black text-lg text-text-primary">It's Quiet Here... Too Quiet.</h3>
                <p className="text-xs font-mono">No recent activity detected in this stream.</p>
              </div>
              <div className="pt-2">
                <Link to="/" className="btn-primary inline-block py-2 px-5 rounded-xl text-xs font-display font-bold uppercase tracking-wider">
                  Explore Films
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {activeFeed.map((act, idx) => (
                <SocialFeedItem key={act.id || idx} act={act} />
              ))}
            </div>
          )}

          {suggestions.length > 0 && feedMode === 'following' && (
            <div className="mt-8 border-t border-border pt-6 space-y-3.5">
              <h3 className="text-xs font-mono font-bold text-text-secondary uppercase flex items-center gap-2 tracking-wider">
                <UserPlus className="w-4 h-4 text-accent" />
                <span>Critics with Shared Movie Taste</span>
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {suggestions.map((sug) => (
                  <SuggestionCard
                    key={sug.id}
                    sug={sug}
                    onFollow={(id) => followMutation.mutate(id)}
                    isPending={followMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SuggestionCard({ sug, onFollow, isPending }) {
  return (
    <div className="bg-bg-elevated border border-border hover:border-border-hover p-4 flex items-center gap-3.5 rounded-2xl transition-colors shadow-sm">
      <Avatar username={sug.username} url={sug.avatar_url} className="w-10 h-10 ring-1 ring-border shrink-0" />
      <div className="text-left flex-1 min-w-0 font-sans">
        <Link to={`/profile/${sug.username}`} className="font-sans font-bold text-text-primary hover:text-accent text-xs transition-colors block truncate">
          @{sug.username}
        </Link>
        <p className="text-[11px] text-text-secondary truncate mt-0.5 font-sans">
          {sug.mutual_count > 0 && (
            <span className="text-accent font-mono font-semibold mr-1.5 inline-flex items-center gap-1">
              <Film className="w-3 h-3 text-accent" /> Shares {sug.mutual_count} films •
            </span>
          )}
          {sug.bio || 'Cinephile exploring film archives.'}
        </p>
      </div>
      <button 
        onClick={() => onFollow(sug.id)} 
        disabled={isPending} 
        className="btn-primary px-3.5 py-1.5 text-xs shrink-0 font-display font-bold uppercase tracking-wider rounded-xl cursor-pointer"
      >
        Follow
      </button>
    </div>
  );
}

function SocialFeedItem({ act }) {
  const movieName = act.title || act.name || `Film #${act.tmdb_movie_id}`;
  const mediaType = act.media_type || 'movie';

  return (
    <div className="bg-bg-elevated border border-border p-4 sm:p-5 rounded-3xl flex gap-3.5 sm:gap-4 shadow-sm hover:border-border-hover transition-colors">
      <Link to={`/media/${mediaType}/${act.tmdb_movie_id}`} className="w-16 h-24 shrink-0 overflow-hidden rounded-2xl border border-border block bg-bg-surface shadow">
        <img src={getPosterUrl(act.poster_path, 'w185')} alt={movieName} className="w-full h-full object-cover" />
      </Link>

      <div className="text-left flex-1 min-w-0 font-sans flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5 pb-1.5 border-b border-border">
            <div className="flex flex-wrap items-center gap-1.5 truncate">
              <Avatar username={act.username} url={act.avatar_url} className="w-5 h-5 ring-1 ring-border" />
              <Link to={`/profile/${act.username}`} className="font-sans font-bold text-text-primary hover:text-accent transition-colors text-xs truncate">
                @{act.username}
              </Link>
              <span className="text-[10px] text-text-secondary font-mono">
                {act.review_text ? 'reviewed' : 'watched'}
              </span>
            </div>

            {act.rating && (
              <div className="shrink-0">
                <RatingBadge rating={act.rating} size="xs" />
              </div>
            )}
          </div>

          <Link to={`/media/${mediaType}/${act.tmdb_movie_id}`} className="font-display font-bold text-xs sm:text-sm text-text-primary hover:text-accent transition-colors line-clamp-1">
            {movieName}
          </Link>

          {act.review_text && (
            <Link to={`/media/${mediaType}/${act.tmdb_movie_id}`} className="block mt-1.5">
              <p className="text-xs text-text-secondary leading-relaxed bg-bg-surface p-2.5 rounded-xl border border-border italic line-clamp-3 font-sans">
                "{act.review_text}"
              </p>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono text-text-muted">
          <Clock className="w-3 h-3 text-text-muted" />
          <span>{new Date(act.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
