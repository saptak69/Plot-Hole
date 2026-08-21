import React, { useId, useMemo, useRef, useState, useEffect } from 'react';
import './GlassSurface.css';

/**
 * ReactBits 3D Liquid GlassSurface Component
 * Official ReactBits GlassSurface architecture featuring:
 * - Dynamic SVG Refraction Filter with Chromatic Aberration (RGB channel splitting)
 * - 3D Specular Gloss and Specular Reflection Highlights
 * - Liquid Curvature and Prismatic Bevel Borders
 * - High-performance GPU acceleration with resilient cross-browser fallback
 */
export default function GlassSurface({
  children,
  width = '100%',
  height = 'auto',
  borderRadius = 20,
  borderWidth = 1,
  brightness = 50,
  opacity = 0.95,
  blur = 16,
  displace = 8,
  backgroundOpacity = 0.15,
  saturation = 1.6,
  distortionScale = 25,
  redOffset = 3,
  greenOffset = 0,
  blueOffset = -3,
  xChannel = 'R',
  yChannel = 'G',
  mixBlendMode = 'screen',
  borderOpacity = 0.25,
  frosted = false,
  className = '',
  style = {},
  ...rest
}) {
  const uniqueId = useId().replace(/[:]/g, '-');
  const filterId = `rb-glass-filter-${uniqueId}`;
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 60 });

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setDimensions({
          width: offsetWidth || 300,
          height: offsetHeight || 60
        });
      }
    };
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const normalizedBrightness = brightness > 2 ? (brightness / 50).toFixed(2) : brightness;

  const containerStyle = useMemo(() => ({
    ...style,
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
    '--rb-glass-blur': typeof blur === 'number' ? `${blur}px` : blur,
    '--rb-glass-saturation': saturation,
    '--rb-glass-brightness': normalizedBrightness,
    '--rb-glass-frost': backgroundOpacity,
    '--rb-glass-border-opacity': borderOpacity,
    '--rb-glass-border-width': typeof borderWidth === 'number' ? `${borderWidth}px` : borderWidth,
    '--rb-glass-radius': typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
  }), [style, width, height, borderRadius, blur, saturation, normalizedBrightness, backgroundOpacity, borderOpacity, borderWidth]);

  return (
    <div
      ref={containerRef}
      className={[
        'rb-glass-surface',
        frosted ? 'rb-glass-surface--frosted' : 'rb-glass-surface--liquid',
        className
      ].filter(Boolean).join(' ')}
      style={containerStyle}
      {...rest}
    >
      {/* Dynamic Embedded SVG Refraction & Chromatic Aberration Filter */}
      <svg
        className="rb-glass-surface__svg"
        aria-hidden="true"
        style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none', opacity: 0 }}
      >
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            {/* 1. Procedural Refractive Liquid Turbulence */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.025 0.04"
              numOctaves="2"
              result="noise"
            />
            <feGaussianBlur in="noise" stdDeviation={displace > 0 ? displace / 4 : 2} result="smoothNoise" />

            {/* 2. Chromatic Aberration (R, G, B channel dispersion) */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="smoothNoise"
              scale={distortionScale + redOffset}
              xChannelSelector={xChannel}
              yChannelSelector={yChannel}
              result="dispRed"
            />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="redChannel"
            />

            <feDisplacementMap
              in="SourceGraphic"
              in2="smoothNoise"
              scale={distortionScale + greenOffset}
              xChannelSelector={xChannel}
              yChannelSelector={yChannel}
              result="dispGreen"
            />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="greenChannel"
            />

            <feDisplacementMap
              in="SourceGraphic"
              in2="smoothNoise"
              scale={distortionScale + blueOffset}
              xChannelSelector={xChannel}
              yChannelSelector={yChannel}
              result="dispBlue"
            />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="blueChannel"
            />

            {/* 3. Blend Chromatic Channels */}
            <feBlend mode="screen" in="redChannel" in2="greenChannel" result="rg" />
            <feBlend mode="screen" in="rg" in2="blueChannel" result="chromaticDisp" />

            {/* 4. Specular Lighting for 3D Curved Glass Bevel */}
            <feSpecularLighting
              in="smoothNoise"
              surfaceScale="4"
              specularConstant="1.2"
              specularExponent="24"
              lightingColor="#ffffff"
              result="specular"
            >
              <fePointLight x={dimensions.width / 2} y="-50" z="220" />
            </feSpecularLighting>
            <feComposite in="specular" in2="SourceAlpha" operator="in" result="specularLight" />

            {/* 5. Composite Final 3D Glass Surface */}
            <feBlend mode="normal" in="specularLight" in2="chromaticDisp" />
          </filter>
        </defs>
      </svg>

      {/* 3D Liquid Specular Gloss Highlight Top Bevel */}
      <div className="rb-glass-surface__specular" aria-hidden="true" />

      {/* Prismatic Iridescent Refractive Edge */}
      <div className="rb-glass-surface__prism-edge" aria-hidden="true" />

      {/* Surface Content */}
      <div className="rb-glass-surface__content">
        {children}
      </div>
    </div>
  );
}
