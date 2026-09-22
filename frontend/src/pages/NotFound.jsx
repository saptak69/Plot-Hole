import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home, Search, Calendar, MessageSquare, Compass, ArrowLeft } from 'lucide-react';
import GlassSurface from '../components/GlassSurface';

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
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={32}
          backgroundOpacity={0.6}
          blur={24}
          borderOpacity={0.16}
          className="p-8 sm:p-12 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_35px_rgba(229,9,20,0.15)]"
        >
          <div className="space-y-6">
            {/* 404 Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e50914]/15 border border-[#e50914]/30 text-[#ff4d5a] font-mono text-xs uppercase tracking-widest font-black shadow-[0_0_15px_rgba(229,9,20,0.25)]">
              <Film className="w-3.5 h-3.5" />
              <span>Scene Missing • 404 Error</span>
            </div>

            {/* Giant Title */}
            <div className="space-y-2">
              <h1 className="font-display font-black text-6xl sm:text-7xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#e50914] via-[#ff6b00] to-[#ffa033]">
                404
              </h1>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                Plot Hole Detected in the Archive
              </h2>
            </div>

            {/* Film Quote */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/6 text-slate-300 font-sans text-xs sm:text-sm italic leading-relaxed">
              "{randomQuote.quote}"
              <span className="block mt-1 text-[11px] font-mono not-italic text-[#ffa033] font-semibold">
                — {randomQuote.film}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              The film reel, chronicle, or page you were looking for seems to have been cut from the final theatrical print.
            </p>

            {/* Quick Action Navigation Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 font-mono text-xs">
              <Link
                to="/"
                className="p-3 rounded-xl bg-gradient-to-r from-[#e50914] to-[#ff5500] hover:brightness-110 text-white font-bold flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(229,9,20,0.3)] transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Explore</span>
              </Link>
              <Link
                to="/schedule"
                className="p-3 rounded-xl bg-white/6 hover:bg-white/12 border border-white/10 text-slate-200 hover:text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-[#ff6b00]" />
                <span>Schedule</span>
              </Link>
              <Link
                to="/spaces"
                className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-white/6 hover:bg-white/12 border border-white/10 text-slate-200 hover:text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#ff4d5a]" />
                <span>Spaces</span>
              </Link>
            </div>
          </div>
        </GlassSurface>
      </div>
    </div>
  );
}
