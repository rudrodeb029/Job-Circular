import React, { useState, useEffect } from 'react';
import { RefreshCw } from './Icons';
import { useAppContext } from '../context/AppContext';

export default function NewDataIcon() {
  const { triggerPillRefresh, isStartupSyncing } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [showPill, setShowPill] = useState(false);

  useEffect(() => {
    // Show the floating loader 10 seconds after app mount (only once)
    const timer = setTimeout(() => {
      setShowPill(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // Keep it visible if startup syncing is in progress
  const shouldShow = showPill || isStartupSyncing;

  if (!shouldShow) return null;

  const handleClick = async () => {
    if (loading || isHiding || isStartupSyncing) return;
    setLoading(true);

    const startTime = Date.now();

    try {
      // Trigger background sync & UI reload (checks Cloudflare for updates)
      await triggerPillRefresh();

      // Guarantee a smooth spin animation for at least 1.5 seconds
      const elapsedTime = Date.now() - startTime;
      const remainingSpinTime = Math.max(0, 1500 - elapsedTime);
      if (remainingSpinTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingSpinTime));
      }

      // Smooth exit animation
      setIsHiding(true);
      await new Promise(resolve => setTimeout(resolve, 350));

      // Hide icon completely
      setShowPill(false);
    } catch (err) {
      console.error('Refresh click error:', err);
      setShowPill(false);
    } finally {
      setLoading(false);
      setIsHiding(false);
    }
  };

  const isSyncing = loading || isStartupSyncing;

  return (
    <div 
      className={`new-data-icon-container ${isHiding ? 'pop-out' : ''}`} 
      title={isSyncing ? "আপডেট করা হচ্ছে..." : "নতুন বিজ্ঞপ্তি দেখুন • চাপুন"}
    >
      <button 
        className={`new-data-icon-btn ${isSyncing ? 'is-syncing' : ''}`}
        onClick={handleClick}
        disabled={isSyncing || isHiding}
        aria-label={isStartupSyncing ? "Syncing data in progress" : "Check for new updates"}
      >
        <span className={`pulse-glow-ring ${isSyncing ? 'syncing-ring' : ''}`}></span>
        <RefreshCw size={18} className={`new-data-icon-svg ${isSyncing ? 'spinning' : ''}`} />
      </button>
    </div>
  );
}
