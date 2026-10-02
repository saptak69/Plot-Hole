import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandMark } from '../components/Logo';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      await signup(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 sm:py-24 px-4 sm:px-6 font-sans relative min-h-[85vh]">
      <div className="w-full max-w-md bg-bg-elevated border border-border rounded-3xl p-6 sm:p-9 shadow-sm">
        {/* Header */}
        <div className="text-center pb-2 space-y-2 mb-6">
          <div className="flex justify-center mb-3">
            <BrandMark size="lg" />
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-black uppercase text-text-primary tracking-tight">
            Join PlotHole
          </h2>
          <p className="text-xs text-text-secondary font-sans">
            Log movies, share verdicts, and mind the gap in cinema
          </p>
        </div>

        {/* Form Content */}
        <div className="space-y-5">
          {error && (
            <div className="p-3.5 border border-error/20 bg-error/10 text-error rounded-2xl flex items-start gap-2.5 text-xs font-sans font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="text-left leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left font-sans">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase text-text-secondary tracking-wider">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-bg-surface text-text-primary border border-border px-4 py-3 pl-10 text-xs rounded-2xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder-text-muted"
                  placeholder="cinephile_alias"
                />
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-text-muted" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase text-text-secondary tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-bg-surface text-text-primary border border-border px-4 py-3 pl-10 text-xs rounded-2xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder-text-muted"
                  placeholder="name@domain.com"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-text-muted" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase text-text-secondary tracking-wider">
                Password (Min 6 characters)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-bg-surface text-text-primary border border-border px-4 py-3 pl-10 text-xs rounded-2xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder-text-muted"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-text-muted" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm font-display font-bold uppercase tracking-wider cursor-pointer"
              >
                <span>{loading ? 'Creating Account...' : 'Join PlotHole Free'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-text-secondary pt-4 border-t border-border font-sans">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-text-primary font-bold font-display uppercase tracking-wider transition-colors">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
