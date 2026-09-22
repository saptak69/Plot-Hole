import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Navbar from './components/Navbar';
import Logo, { BrandMark } from './components/Logo';
import CinemaBackground from './components/CinemaBackground';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import SearchPage from './pages/Search';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SocialFeed from './pages/SocialFeed';
import ListsPage from './pages/Lists';
import Schedule from './pages/Schedule';
import Spaces from './pages/Spaces';
import NotFound from './pages/NotFound';
import PersonModal from './components/PersonModal';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes fresh cache
      gcTime: 30 * 60 * 1000, // 30 minutes cache retention
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function NavigateToMedia() {
  const { id } = useParams();
  return <Navigate to={`/media/movie/${id}`} replace />;
}

function NavigateToContent() {
  const { slug } = useParams();
  const numericId = parseInt(slug, 10);
  if (!isNaN(numericId)) {
    return <Navigate to={`/media/movie/${numericId}`} replace />;
  }
  return <Navigate to={`/search?q=${encodeURIComponent(slug.replace(/-/g, ' '))}`} replace />;
}

function MainLayout() {
  const [selectedPersonId, setSelectedPersonId] = useState(null);

  return (
    <>
      <div className="min-h-screen bg-[#070709] text-slate-100 flex flex-col selection:bg-[#e50914] selection:text-white relative">
        {/* 3D Vanta Cinema Background (Cinematic Mist) + Projector Embers */}
        <CinemaBackground showParticles={true} particleCount={45} />

        {/* Subtle 35mm Tactile Film Grain */}
        {/* <div className="film-grain" /> */}

        <Navbar />

        <main className="flex-1 flex flex-col pb-20 md:pb-0 relative z-10">
          <Routes>
            <Route path="/" element={<Home onOpenPerson={(id) => setSelectedPersonId(id)} />} />
            <Route path="/explore" element={<Home onOpenPerson={(id) => setSelectedPersonId(id)} />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/spaces" element={<Spaces />} />
            <Route path="/collections" element={<ListsPage />} />
            <Route path="/collections/:id" element={<ListsPage />} />
            <Route path="/lists" element={<ListsPage />} />
            <Route path="/lists/:id" element={<ListsPage />} />
            <Route path="/movies/:id" element={<NavigateToMedia />} />
            <Route path="/content/:slug" element={<NavigateToContent />} />
            <Route path="/media/:mediaType/:id" element={<MovieDetails onOpenPerson={(id) => setSelectedPersonId(id)} />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/u/:username" element={<Profile />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/social" element={<SocialFeed />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Luxury Cinema Footer */}
        <footer className="py-14 border-t border-white/8 bg-[#040406] text-slate-400 font-sans relative overflow-hidden">
          {/* Ambient Bottom Glow */}
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#e50914]/8 via-transparent to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 space-y-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/8 text-center md:text-left">
              <div className="space-y-2">
                <Logo size="md" showTagline={true} />
                <p className="text-xs text-slate-400 max-w-md leading-relaxed pt-1">
                  The social chronicle & review vault for discerning cinephiles. Discover masterworks, log honest verdicts, and mind the gap in cinema.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono">
                <Link to="/" className="hover:text-[#e50914] transition-colors">Explore</Link>
                <Link to="/schedule" className="hover:text-[#e50914] transition-colors">Schedule</Link>
                <Link to="/spaces" className="hover:text-[#e50914] transition-colors">Spaces</Link>
                <Link to="/lists" className="hover:text-[#e50914] transition-colors">Collections</Link>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
              <p>© {new Date().getFullYear()} PlotHole Chronicles. All rights reserved.</p>
              <p className="flex items-center gap-2">
                <span>Curated with craft</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#e50914] inline-block shadow-[0_0_8px_#e50914]" />
                <span>Powered by TMDB API</span>
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Person Filmography Modal */}
      <PersonModal personId={selectedPersonId} onClose={() => setSelectedPersonId(null)} />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <MainLayout />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
