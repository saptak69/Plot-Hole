import React, { useRef, useState } from 'react';

/**
 * AICanvas Realistic 3D Interactive Glass Card Component
 * Features:
 * - Dynamic cursor-following specular glare highlight
 * - 3D spring perspective tilt with smooth damping
 * - Animated liquid glass sheen sweep on hover
 * - Prismatic bevel refraction borders
 */
export default function GlassCard({
  children,
  className = '',
  style = {},
  interactive = true,
  tilt = true,
  glare = true,
  sheen = true,
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tilt) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      setRotate({ x: rotateX, y: rotateY });
    }

    if (glare) {
      setGlarePos({ x, y });
    }
  };

  const handleMouseEnter = () => {
    if (interactive) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setIsHovered(false);
      setRotate({ x: 0, y: 0 });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`glass-card ${sheen ? 'glass-sheen-active' : ''} ${className}`}
      style={{
        ...style,
        transform:
          interactive && tilt && isHovered
            ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateY(-4px) scale3d(1.01, 1.01, 1.01)`
            : style.transform || 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)',
      }}
      {...props}
    >
      {/* Top Specular Reflection Layer */}
      <div className="glass-specular-top" aria-hidden="true" />

      {/* Dynamic Cursor Glare Highlight Layer */}
      {interactive && glare && isHovered && (
        <div
          className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-200"
          aria-hidden="true"
          style={{
            background: `radial-gradient(380px circle at ${glarePos.x}px ${glarePos.y}px, rgba(255, 255, 255, 0.18), rgba(229, 9, 20, 0.06) 40%, transparent 65%)`,
          }}
        />
      )}

      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
