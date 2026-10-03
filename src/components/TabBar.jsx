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
 * Y-axis locked at 0.
 */
export const TabContent = ({ activeTab, tabs = [], children, className = '' }) => {
  const isFirstRender = useRef(true);
  const prevTabRef = useRef(activeTab);
  const [slideDirection, setSlideDirection] = useState(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (prevTabRef.current !== activeTab) {
      const prevIndex = tabs.findIndex((t) => t.id === prevTabRef.current);
      const currentIndex = tabs.findIndex((t) => t.id === activeTab);
      setSlideDirection(currentIndex < prevIndex ? 'back' : 'forward');
      prevTabRef.current = activeTab;
    }
  }, [activeTab, tabs]);

  const animationClass =
    slideDirection === 'back'
      ? 'tab-slide-back'
      : slideDirection === 'forward'
      ? 'tab-slide-forward'
      : '';

  return (
    <div
      key={activeTab}
      className={`tab-pane-content ${animationClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default TabBar;
