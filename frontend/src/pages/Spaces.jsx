import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, Flame, Play, Heart, Share2, Sparkles, Send, Film, 
  CheckCircle2, Plus, MessageCircle, AlertOctagon, TrendingUp, Bell, Copy, Check,
  ChevronDown, ChevronUp, Trash2, Loader2
} from 'lucide-react';
import { API_URL, getPosterUrl, getAuthHeaders } from '../config';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';
import RatingBadge from '../components/RatingBadge';

function extractYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url.trim();
}

function SpacesCommentsThread({ postId, onCommentAdded }) {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real comments for this post
  const { data: comments = [], isLoading, refetch } = useQuery({
    queryKey: ['spacesComments', postId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/spaces/posts/${postId}/comments`);
      if (!res.ok) return [];
      return res.json();
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.addToast('Please sign in to join the discussion', 'info');
      return;
    }
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/spaces/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ comment_text: commentText.trim() })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to post reply');
      }
      setCommentText('');
      refetch();
      if (onCommentAdded) onCommentAdded();
      queryClient.invalidateQueries({ queryKey: ['spacesPosts'] });
      toast.addToast('Reply published to Spaces thread!', 'success');
    } catch (err) {
      toast.addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-3 mt-3 border-t border-white/8 space-y-3">
      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
        <span className="font-bold text-white">Live Discussion Thread ({comments.length})</span>
        <span>Replies are public to all cinephiles</span>
      </div>

      {/* Comment List */}
      {isLoading ? (
        <div className="space-y-2 py-2">
          <div className="h-10 w-full rounded-2xl bg-white/5 skeleton-shimmer" />
          <div className="h-10 w-4/5 rounded-2xl bg-white/5 skeleton-shimmer" />
        </div>
      ) : comments.length === 0 ? (
        <div className="p-4 rounded-2xl bg-black/30 border border-white/6 text-center space-y-1">
          <p className="text-xs font-mono text-slate-400">No replies in this thread yet.</p>
          <p className="text-[11px] text-slate-500">Drop your perspective and start the debate!</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5 bg-black/40 hover:bg-black/60 transition-colors p-3 rounded-2xl border border-white/6 text-left">
              <Avatar username={c.user?.username} url={c.user?.avatarUrl} className="w-7 h-7 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-bold text-xs text-white truncate">
                    {c.user?.displayName || c.user?.username || 'Cinephile'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">{c.time}</span>
                </div>
                <p className="text-xs text-slate-200 pt-1 leading-relaxed">{c.commentText}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Reply Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
        <input
          type="text"
          placeholder={user ? "Write a cinephile reply..." : "Sign in to participate..."}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={!user || isSubmitting}
          className="flex-1 bg-black/60 border border-white/12 focus:border-[#ff6b00] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!user || !commentText.trim() || isSubmitting}
          className="btn-fire px-4 py-2 rounded-xl text-xs font-mono font-bold disabled:opacity-40 cursor-pointer shrink-0 flex items-center gap-1.5"
        >
          {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>Reply</span>
        </button>
      </form>
    </div>
  );
}

export default function Spaces() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'discussions' | 'trailers' | 'news' | 'reviews'
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [expandedPostIds, setExpandedPostIds] = useState(new Set());
  
  // New Post Form State
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('discussion');
  const [postContent, setPostContent] = useState('');
  const [postMediaTag, setPostMediaTag] = useState('');
  const [postMediaId, setPostMediaId] = useState('');
  const [postVideoUrl, setPostVideoUrl] = useState('');
  const [postRating, setPostRating] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real Database Query for Spaces Posts
  const { data: spacesPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['spacesPosts', activeTab],
    queryFn: async () => {
      const token = localStorage.getItem('plothole_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const url = activeTab === 'all' 
        ? `${API_URL}/spaces/posts` 
        : `${API_URL}/spaces/posts?category=${activeTab === 'discussions' ? 'discussion' : activeTab === 'trailers' ? 'trailer' : activeTab === 'reviews' ? 'review' : activeTab}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error('Could not fetch community spaces');
      return res.json();
    }
  });

  const toggleComments = (postId) => {
    setExpandedPostIds(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const handleLikeToggle = async (postId) => {
    if (!user) {
      toast.addToast('Sign in to like community discussions', 'info');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/spaces/posts/${postId}/like`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['spacesPosts'] });
      }
    } catch (err) {
      console.error('Like toggle failed:', err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.addToast('Sign in to publish thoughts in Cinema Spaces', 'info');
      return;
    }
    if (!postTitle.trim() || !postContent.trim()) {
      toast.addToast('Please enter both headline and content for your post', 'error');
      return;
    }

    setIsSubmitting(true);
    const videoEmbedId = extractYouTubeId(postVideoUrl);

    try {
      const res = await fetch(`${API_URL}/spaces/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          title: postTitle.trim(),
          content: postContent.trim(),
          category: postCategory,
          media_tag: postMediaTag.trim() || null,
          tmdb_movie_id: postMediaId ? parseInt(postMediaId) : null,
          video_embed_id: videoEmbedId,
          rating: postCategory === 'review' ? postRating : null
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to publish post');
      }

      queryClient.invalidateQueries({ queryKey: ['spacesPosts'] });
      setPostTitle('');
      setPostContent('');
      setPostMediaTag('');
      setPostMediaId('');
      setPostVideoUrl('');
      setIsComposerOpen(false);
      toast.addToast('Your discussion topic has been published to Spaces!', 'success');
    } catch (err) {
      toast.addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 pb-24 font-sans text-slate-100 relative overflow-hidden">
      
      {/* Header Showcase */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-6 relative z-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/8 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b00]/15 border border-[#ff6b00]/30 text-xs font-mono font-bold text-[#ffa033] uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Live Cinephile Community</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
              Cinema Spaces & Debates
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-lg">
              Drop honest verdicts, share fresh trailer drops, and debate cinematic masterworks with fellow movie lovers.
            </p>
          </div>

          <button
            onClick={() => setIsComposerOpen(true)}
            className="btn-fire py-2.5 px-5 rounded-2xl text-xs font-display font-bold uppercase tracking-wider flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Start a Topic</span>
          </button>
        </div>

        {/* Tab Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {[
            { id: 'all', label: 'All Feed' },
            { id: 'discussions', label: 'Discussions' },
            { id: 'trailers', label: 'Trailer Drops' },
            { id: 'news', label: 'Cinema News' },
            { id: 'reviews', label: 'Critical Takes' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#e50914] to-[#ff6b00] text-white shadow-[0_0_14px_rgba(255,107,0,0.35)]'
                  : 'bg-[#101015] hover:bg-white/10 text-slate-400 hover:text-white border border-white/8'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Post Composer Modal */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
          <div className="w-full max-w-xl bg-[#0e0e13] border border-white/12 rounded-3xl p-6 shadow-2xl space-y-4 text-left animate-fade-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <h3 className="font-display font-black text-lg text-white">Create Space Topic</h3>
              <button
                onClick={() => setIsComposerOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Topic Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {['discussion', 'trailer', 'news', 'review'].map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setPostCategory(cat)}
                      className={`py-1.5 rounded-xl text-[11px] font-mono uppercase font-bold transition-all cursor-pointer ${
                        postCategory === cat
                          ? 'bg-[#ff6b00] text-white shadow-[0_0_10px_rgba(255,107,0,0.4)]'
                          : 'bg-white/6 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Headline</label>
                <input
                  type="text"
                  placeholder="e.g. What makes the cinematography of Dune Part Two so visceral?"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-[#ff6b00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Film / Series Tag (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dune: Part Two (2024)"
                    value={postMediaTag}
                    onChange={(e) => setPostMediaTag(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#ff6b00]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">TMDB Movie ID (Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 693134"
                    value={postMediaId}
                    onChange={(e) => setPostMediaId(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#ff6b00]"
                  />
                </div>
              </div>

              {postCategory === 'trailer' && (
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">YouTube Trailer Link or ID</label>
                  <input
                    type="text"
                    placeholder="e.g. https://www.youtube.com/watch?v=Way9Dexny3w"
                    value={postVideoUrl}
                    onChange={(e) => setPostVideoUrl(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#ff6b00]"
                  />
                </div>
              )}

              {postCategory === 'review' && (
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">PlotHole Rating</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { val: 1, label: 'Skip' },
                      { val: 2, label: 'Timepass' },
                      { val: 3, label: 'Go For It' },
                      { val: 4, label: 'Perfection' }
                    ].map(r => (
                      <button
                        type="button"
                        key={r.val}
                        onClick={() => setPostRating(r.val)}
                        className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          postRating === r.val ? 'bg-[#ff6b00] text-white' : 'bg-white/6 text-slate-400'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Your Perspective</label>
                <textarea
                  rows={4}
                  placeholder="Share your detailed analysis, questions, or reaction..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-[#ff6b00] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/8">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-fire px-5 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider cursor-pointer"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish to Spaces'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Spaces Posts Feed */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-5 relative z-10">
        {postsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#101015] border border-white/8 rounded-3xl p-6 space-y-4">
                <div className="h-6 w-1/3 rounded-xl bg-white/5 skeleton-shimmer" />
                <div className="h-16 w-full rounded-2xl bg-white/5 skeleton-shimmer" />
              </div>
            ))}
          </div>
        ) : spacesPosts.length === 0 ? (
          <div className="text-center py-20 space-y-3 bg-[#101015] rounded-3xl border border-white/8">
            <MessageSquare className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-base font-display font-bold text-white">No discussions found in this feed</p>
            <p className="text-xs text-slate-400 font-mono">Be the first to start a conversation in this space!</p>
          </div>
        ) : (
          spacesPosts.map(post => {
            const isCommentsExpanded = expandedPostIds.has(post.id);

            return (
              <article
                key={post.id}
                className="bg-[#101015] hover:bg-[#14141c] border border-white/8 hover:border-[#ff6b00]/40 rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-xl space-y-4 text-left"
              >
                {/* Post Header: Author, Badge, Timestamp, Category Tag */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar username={post.author?.username} url={post.author?.avatarUrl} className="w-9 h-9 ring-1 ring-white/15" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-white truncate">
                          {post.author?.displayName || post.author?.username}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-[#ff6b00]/15 border border-[#ff6b00]/30 text-[9px] font-mono font-bold text-[#ffa033]">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>{post.author?.badge || 'Cinephile'}</span>
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400">
                        @{post.author?.username} • {post.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.rating && <RatingBadge rating={post.rating} size="xs" />}
                    <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border ${
                      post.category === 'trailer'
                        ? 'bg-[#e50914]/15 text-[#ff4d5a] border-[#e50914]/30'
                        : post.category === 'news'
                        ? 'bg-[#00a8e1]/15 text-[#38bdf8] border-[#00a8e1]/30'
                        : post.category === 'review'
                        ? 'bg-[#ff6b00]/15 text-[#ffa033] border-[#ff6b00]/30'
                        : 'bg-white/8 text-slate-300 border-white/10'
                    }`}>
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Post Headline & Body */}
                <div className="space-y-2">
                  <h2 className="text-lg sm:text-xl font-display font-black text-white tracking-tight leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>
                </div>

                {/* Embedded Media / Trailer Player */}
                {post.videoEmbedId && (
                  <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-white/10 shadow-lg">
                    <iframe
                      src={`https://www.youtube.com/embed/${post.videoEmbedId}`}
                      title={post.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Film Entity Tag Pill */}
                {post.mediaTag && (
                  <Link
                    to={post.mediaId ? `/media/movie/${post.mediaId}` : `/search?q=${encodeURIComponent(post.mediaTag)}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 hover:bg-black/80 border border-white/10 text-xs font-mono text-[#ffa033] transition-colors"
                  >
                    <Film className="w-3.5 h-3.5 text-[#ff6b00]" />
                    <span>Tagged: {post.mediaTag}</span>
                    <span className="text-[10px] text-slate-400">View Dossier →</span>
                  </Link>
                )}

                {/* Action Buttons: Like, Comment Toggle, Share */}
                <div className="flex items-center justify-between pt-3 border-t border-white/6 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikeToggle(post.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                        post.isLiked ? 'text-[#ff4d5a] font-bold' : 'hover:text-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-[#ff4d5a]' : ''}`} />
                      <span>{post.likes}</span>
                    </button>

                    <button
                      onClick={() => toggleComments(post.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isCommentsExpanded ? 'text-[#ffa033] font-bold' : 'hover:text-white'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.commentsCount} comments</span>
                      {isCommentsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.addToast('Link to Space topic copied!', 'info');
                    }}
                    className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>

                {/* Expandable Real Comments Section */}
                {isCommentsExpanded && (
                  <SpacesCommentsThread
                    postId={post.id}
                    onCommentAdded={() => {
                      queryClient.invalidateQueries({ queryKey: ['spacesPosts'] });
                    }}
                  />
                )}
              </article>
            );
          })
        )}
      </div>

    </div>
  );
}
