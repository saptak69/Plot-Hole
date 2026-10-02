import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * GlassModal — Accessible modal dialog
 * 
 * Features:
 * - Escape to close
 * - Click backdrop to dismiss
 * - Focus trap (returns focus on close)
 * - Body scroll lock
 * - Proper ARIA attributes
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
  const previousFocus = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Store and manage focus
    previousFocus.current = document.activeElement;
    setTimeout(() => closeRef.current?.focus(), 50);

    // Keyboard and scroll
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previousFocus.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4 sm:p-6 overflow-y-auto`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`w-full ${maxWidth} bg-bg-elevated rounded-2xl p-6 sm:p-7 relative shadow-2xl border border-border animate-fade-up ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4 mb-5">
          <div>
            {title && (
              <h2 id="modal-title" className="font-display font-bold text-lg sm:text-xl text-text-primary">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
