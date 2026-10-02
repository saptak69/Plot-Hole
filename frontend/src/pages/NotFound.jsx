import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home, Calendar, MessageSquare } from 'lucide-react';

export default function NotFound() {
  const filmQuotes = [
    { quote: "There's no place like home.", film: "The Wizard of Oz (1939)" },
    { quote: "Houston, we have a problem.", film: "Apollo 13 (1995)" },
    { quote: "You're in the wrong place at the wrong time.", film: "Die Hard 2 (1990)" },
    { quote: "Forget it, Jake. It's Chinatown.", film: "Chinatown (1974)" }
  ];

  const randomQuote = filmQuotes[Math.floor(Math.random() * filmQuotes.length)];

  return (
    <div className="flex-1 flex items-center justify-center min-h-[75vh] px-4 py-16 text-center font-sans relative z-10">
      <div className="max-w-xl w-full space-y-6">
        <div className="bg-bg-elevated border border-border p-8 sm:p-12 shadow-sm rounded-3xl">
          <div className="space-y-6">
            {/* 404 Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error/10 border border-error/20 text-error font-mono text-xs uppercase tracking-widest font-black">
              <Film className="w-3.5 h-3.5" />
              <span>Scene Missing • 404 Error</span>
            </div>

            {/* Giant Title */}
            <div className="space-y-2">
              <h1 className="font-display font-black text-6xl sm:text-7xl tracking-tighter text-accent">
                404
              </h1>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-text-primary tracking-tight">
                Plot Hole Detected in the Archive
              </h2>
            </div>

            {/* Film Quote */}
            <div className="p-4 rounded-2xl bg-bg-surface border border-border text-text-secondary font-sans text-xs sm:text-sm italic leading-relaxed">
              "{randomQuote.quote}"
              <span className="block mt-1 text-[11px] font-mono not-italic text-accent font-semibold">
                — {randomQuote.film}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text-muted max-w-sm mx-auto leading-relaxed">
              The film reel, chronicle, or page you were looking for seems to have been cut from the final theatrical print.
            </p>

            {/* Quick Action Navigation Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 font-mono text-xs">
              <Link
                to="/"
                className="btn-primary p-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Explore</span>
              </Link>
              <Link
                to="/schedule"
                className="btn-secondary p-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-accent" />
                <span>Schedule</span>
              </Link>
              <Link
                to="/spaces"
                className="btn-secondary col-span-2 sm:col-span-1 p-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-error" />
                <span>Spaces</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
