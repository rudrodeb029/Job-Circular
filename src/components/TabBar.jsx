import React, { useRef, useState, useEffect } from 'react';

/**
 * Production-ready, GPU-accelerated Tab & Toggle Bar
 * - Instant initialization with zero layout shift / stretching
 * - Strict horizontal indicator sliding with cubic-bezier easing
 * - Y-axis locked at 0 (translate3d)
 * - Hardware acceleration with will-change: transform
 */
const TabBar = ({ tabs = [], activeTab, onTabChange, className = '', style = {} }) => {
  const activeIndex = Math.max(0, tabs.findIndex((t) => t.id === activeTab));
  const tabCount = tabs.length || 1;
  const tabWidthPercent = 100 / tabCount;

  return (
    <div
      className={`tabs-container ${className}`}
      style={style}
    >
      {/* Sliding Active Pill Indicator */}
      <div
        className="tab-sliding-indicator"
        style={{
          width: `calc(${tabWidthPercent}% - 8px)`,
          left: '4px',
          transform: `translate3d(${activeIndex * 100}%, 0, 0)`,
          transition: 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform'
        }}
      />

      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            type="button"
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

/**
 * Directional Tab Content Wrapper
 * Slides tab content strictly horizontally (left <-> right) ONLY on user tab changes.
 * Does NOT slide on initial page mount (prevents double-slide / zigzag).
 * Synchronously evaluated on render (Frame 0 execution - zero flash/pop).
 * Y-axis locked at 0.
 */
export const TabContent = ({ activeTab, tabs = [], children, className = '', style = {} }) => {
  const isFirstRenderRef = useRef(true);
  const prevTabRef = useRef(activeTab);
  const slideDirectionRef = useRef(null);

  if (isFirstRenderRef.current) {
    isFirstRenderRef.current = false;
  } else if (prevTabRef.current !== activeTab) {
    const prevIndex = tabs.findIndex((t) => t.id === prevTabRef.current);
    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
    slideDirectionRef.current = currentIndex < prevIndex ? 'back' : 'forward';
    prevTabRef.current = activeTab;
  }

  const animationClass =
    slideDirectionRef.current === 'back'
      ? 'tab-slide-back'
      : slideDirectionRef.current === 'forward'
      ? 'tab-slide-forward'
      : '';

  return (
    <div
      key={activeTab}
      className={`tab-pane-content ${animationClass} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default TabBar;
