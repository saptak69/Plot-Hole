import React from 'react';

/**
 * GlassCard — Clean surface card
 * 
 * Simplified from the previous 3D tilt/glare/sheen version.
 * Now just a styled container with consistent border and hover state.
 */
export default function GlassCard({
  children,
  className = '',
  style = {},
  onClick,
  as: Tag = 'div',
  ...props
}) {
  return (
    <Tag
      onClick={onClick}
      className={`glass-card ${className}`}
      style={style}
      {...props}
    >
      {children}
    </Tag>
  );
}
