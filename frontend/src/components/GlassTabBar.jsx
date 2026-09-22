import React, { useRef, useEffect, useState } from 'react';

/**
 * AICanvas Liquid Glass Tab Bar Component
 * Features:
 * - Frosted glass pill track with specular top rim
 * - Animated sliding liquid indicator capsule with spring physics
 * - Touch-optimized with haptic-like active feedback
 */
export default function GlassTabBar({
  tabs = [],
  activeTab,
  onTabChange,
  className = '',
}) {
  const containerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const activeButton = containerRef.current.querySelector(`[data-tab-id="${activeTab}"]`);
    if (activeButton) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
        opacity: 1,
      });
    }
  }, [activeTab, tabs]);

  return (
    <div
      ref={containerRef}
      className={`relative flex select-none items-center overflow-x-auto gap-1.5 p-1.5 rounded-2xl glass-panel border border-white/12 scrollbar-none shadow-2xl ${className}`}
      style={{
        backdropFilter: 'blur(24px) saturate(175%)',
        WebkitBackdropFilter: 'blur(24px) saturate(175%)',
      }}
    >
      {/* Sliding Liquid Glass Indicator Capsule */}
      <div
        className="absolute top-1.5 bottom-1.5 rounded-xl glass-btn-red pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          opacity: indicatorStyle.opacity,
          zIndex: 1,
        }}
      />

      {/* Tab Buttons */}
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative z-10 px-2.5 sm:px-4 py-1.5 sm:py-2 font-display font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              isActive ? 'text-white' : 'text-slate-300 hover:text-white hover:bg-white/6'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
