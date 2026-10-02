import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Navbar from './components/Navbar';
import Logo from './components/Logo';
import AmbientBackground from './components/CinemaBackground';
import ErrorBoundary from './components/ErrorBoundary';
import PersonModal from './components/PersonModal';

import './App.css';

// Route-level code splitting — each page loads only when visited
const Home = lazy(() => import('./pages/Home'));
const MovieDetails = lazy(() => import('./pages/MovieDetails'));
const SearchPage = lazy(() => import('./pages/Search'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const SocialFeed = lazy(() => import('./pages/SocialFeed'));
const ListsPage = lazy(() => import('./pages/Lists'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Spaces = lazy(() => import('./pages/Spaces'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Route-level loading fallback
function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="space-y-3 text-center">
        <div className="w-8 h-8 mx-auto rounded-full border-2 border-border border-t-accent animate-spin" />
        <p className="text-text-muted text-sm font-mono">Loading...</p>
      </div>
    </div>
  );
}

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
      <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col selection:bg-accent selection:text-white relative">
        {/* Ambient cinematic background — CSS only, zero runtime cost */}
        <AmbientBackground />

        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-accent focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>

        <Navbar />

        <main id="main-content" className="flex-1 flex flex-col pb-20 md:pb-0 relative z-10">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </ErrorBoundary>
        </main>

        {/* Footer */}
        <footer className="py-12 border-t border-border bg-bg-primary text-text-muted font-sans relative">
          <div className="max-w-7xl mx-auto px-6 space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-border text-center md:text-left">
              <div className="space-y-2">
                <Logo size="md" showTagline={true} />
                <p className="text-xs text-text-muted max-w-md leading-relaxed">
                  The editorial film journal for discerning cinephiles. Discover films, log honest verdicts, and share your taste.
                </p>
              </div>

              <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono" aria-label="Footer navigation">
                <Link to="/" className="hover:text-accent transition-colors">Discover</Link>
                <Link to="/schedule" className="hover:text-accent transition-colors">Schedule</Link>
                <Link to="/spaces" className="hover:text-accent transition-colors">Spaces</Link>
                <Link to="/lists" className="hover:text-accent transition-colors">Collections</Link>
              </nav>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-text-faint">
              <p>© {new Date().getFullYear()} PlotHole. All rights reserved.</p>
              <p className="flex items-center gap-2">
                <span>Powered by TMDB</span>
                <span className="w-1 h-1 rounded-full bg-accent inline-block" aria-hidden="true" />
                <span>Built with care</span>
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
