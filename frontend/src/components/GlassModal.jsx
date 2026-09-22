import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * AICanvas Realistic Glass Modal Dialog Component
 * Features:
 * - Deep multi-tier frosted glass backdrop blur
 * - Specular rim highlights and glossy top reflection
 * - Spring scale-in entry animation
 * - Accessible keyboard (Escape to close) and backdrop tap to dismiss
 */
export default function GlassModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  className = '',
  zIndex = 'z-[1050]',
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4 sm:p-6 overflow-y-auto`}
      style={{
        backgroundColor: 'rgba(4, 4, 7, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full ${maxWidth} glass-modal rounded-3xl p-6 sm:p-7 relative shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(229,9,20,0.12)] border border-white/16 animate-fade-up ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular Top Reflection Layer */}
        <div className="glass-specular-top" aria-hidden="true" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-5 relative z-10">
          <div>
            {title && (
              <h3 className="font-display font-black text-lg sm:text-xl text-white tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 font-sans mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
