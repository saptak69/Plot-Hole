import React from 'react';

/**
 * AmbientBackground — Performant CSS-only background
 * Replaces Three.js + Vanta.js + Canvas particles with a static
 * CSS radial gradient that gives the same cinematic depth feel
 * at zero CPU/GPU cost.
 */
export default function AmbientBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 50% 0%, rgba(229, 9, 20, 0.06) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 100%, rgba(255, 107, 0, 0.04) 0%, transparent 50%),
          var(--color-bg-primary)
        `,
      }}
    />
  );
}
