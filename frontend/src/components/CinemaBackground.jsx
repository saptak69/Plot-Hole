import React, { useEffect, useRef, useCallback } from 'react';

/**
 * Loads an external script dynamically if not already on window
 */
function loadScript(src, id) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.id = id;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

export default function CinemaBackground({
  showParticles = true,
  particleCount = 50,
}) {
  const vantaContainerRef = useRef(null);
  const vantaEffectRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // ============================================================
  // 1. VANTA.JS 3D CINEMATIC MIST (FOG) ENGINE
  // ============================================================
  const initVantaMist = useCallback(async () => {
    if (!vantaContainerRef.current) return;

    // Destroy existing Vanta instance if any
    if (vantaEffectRef.current && typeof vantaEffectRef.current.destroy === 'function') {
      try {
        vantaEffectRef.current.destroy();
      } catch (e) {
        // ignore
      }
      vantaEffectRef.current = null;
    }

    try {
      // Ensure Three.js is loaded
      if (!window.THREE) {
        await loadScript(
          'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js',
          'three-cdn-script'
        );
      }

      // Load Vanta Fog script
      if (!window.VANTA || !window.VANTA.FOG) {
        await loadScript(
          'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js',
          'vanta-fog-cdn'
        );
      }

      const THREE = window.THREE;
      const VANTA = window.VANTA;

      if (!VANTA || !VANTA.FOG || !vantaContainerRef.current) return;

      const el = vantaContainerRef.current;

      vantaEffectRef.current = VANTA.FOG({
        el,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        highlightColor: 0xe50914, // Netflix Red Spotlight
        midtoneColor: 0x3a0810,   // Deep Crimson Velvet
        lowlightColor: 0x140306,  // Dark Ruby Void
        baseColor: 0x070709,      // Deep Obsidian Pitch Black Base
        blurFactor: 0.58,
        speed: 1.15,
        zoom: 1.05,
      });
    } catch (err) {
      console.warn('Vanta Cinematic Mist initialization notice:', err);
    }
  }, []);

  useEffect(() => {
    initVantaMist();

    return () => {
      if (vantaEffectRef.current && typeof vantaEffectRef.current.destroy === 'function') {
        try {
          vantaEffectRef.current.destroy();
        } catch (e) {
          // ignore
        }
        vantaEffectRef.current = null;
      }
    };
  }, [initVantaMist]);

  // ============================================================
  // 2. AMBIENT 2D FLOATING PROJECTOR DUST & EMBER PARTICLES
  // ============================================================
  useEffect(() => {
    if (!showParticles) return;
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!particleCanvasRef.current) return;
      width = particleCanvasRef.current.width = window.innerWidth;
      height = particleCanvasRef.current.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    const count = Math.min(particleCount, 55);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        baseAlpha: Math.random() * 0.4 + 0.15,
        alpha: 0.2,
        phase: Math.random() * Math.PI * 2,
        speedY: -(Math.random() * 0.35 + 0.1),
        speedX: (Math.random() - 0.5) * 0.25,
        color: Math.random() > 0.45 ? '255, 184, 0' : '229, 9, 20', // Gold or Scarlet
      });
    }

    let running = true;
    let t = 0;

    const render = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      t += 0.015;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(t + p.phase) * 0.15;
        p.alpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(t * 1.8 + p.phase));

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${Math.max(0, p.alpha)})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = `rgba(${p.color}, 0.5)`;
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [showParticles, particleCount]);

  return (
    <>
      {/* 3D Vanta.js Fog Canvas Container */}
      <div
        ref={vantaContainerRef}
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          backgroundColor: '#070709',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
        }}
      />

      {/* Floating Stardust Embers 2D Overlay */}
      {showParticles && (
        <canvas
          ref={particleCanvasRef}
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
          }}
        />
      )}

      {/* Subtle Cinema Vignette for Apple TV+ Depth */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(7, 7, 9, 0.75) 100%)',
          zIndex: 0,
        }}
      />
    </>
  );
}
