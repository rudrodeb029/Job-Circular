import React, { useRef, useState, useEffect } from 'react';

/**
 * Production-ready, GPU-accelerated Tab & Toggle Bar
 * - Strict horizontal indicator sliding with cubic-bezier easing
 * - Y-axis locked at 0 (translate3d)
 * - Hardware acceleration with will-change: transform, width
 */
const TabBar = ({ tabs = [], activeTab, onTabChange, className = '', style = {} }) => {
  const containerRef = useRef(null);
  const tabRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  const updateIndicator = () => {
    const activeEl = tabRefs.current[activeTab];
    const container = containerRef.current;
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeEl.getBoundingClientRect();
      const left = tabRect.left - containerRect.left;
      const width = tabRect.width;

      setIndicator({
        left,
        width,
        ready: true
      });
    }
  };

  useEffect(() => {
    updateIndicator();
  }, [activeTab, tabs]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab]);

  return (
    <div
      ref={containerRef}
      className={`tabs-container ${className}`}
      style={style}
    >
      {/* Sliding Active Pill Indicator */}
      <div
        className="tab-sliding-indicator"
        style={{
          width: `${indicator.width}px`,
          transform: `translate3d(${indicator.left}px, 0, 0)`,
          transition: indicator.ready
            ? 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), width 0.32s cubic-bezier(0.22, 1, 0.36, 1)'
            : 'none',
          opacity: indicator.width > 0 ? 1 : 0
        }}
      />

      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[tab.id] = el)}
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
 * Slides tab content strictly horizontally (left <-> right) based on tab index order.
 * Y-axis locked at 0.
 */
export const TabContent = ({ activeTab, tabs = [], children, className = '' }) => {
  const prevTabRef = useRef(activeTab);
  const prevIndex = tabs.findIndex(t => t.id === prevTabRef.current);
  const currentIndex = tabs.findIndex(t => t.id === activeTab);

  // If going to a lower index: slide back (left to right)
  // If going to a higher index: slide forward (right to left)
  const isBack = currentIndex !== -1 && prevIndex !== -1 && currentIndex < prevIndex;

  useEffect(() => {
    prevTabRef.current = activeTab;
  }, [activeTab]);

  return (
    <div
      key={activeTab}
      className={`tab-pane-content ${isBack ? 'tab-slide-back' : 'tab-slide-forward'} ${className}`}
    >
      {children}
    </div>
  );
};

export default TabBar;
