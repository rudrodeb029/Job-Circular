import React, { useState } from 'react';
import { RefreshCw } from './Icons';
import { useAppContext } from '../context/AppContext';

export default function NewDataIcon() {
  const { hasNewUpdates, setHasNewUpdates, triggerPillRefresh, isStartupSyncing } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  const shouldShow = hasNewUpdates || isStartupSyncing;

  if (!shouldShow) return null;

  const handleClick = async () => {
    if (loading || isHiding || isStartupSyncing) return;
    setLoading(true);

    const startTime = Date.now();

    try {
      // 1. Trigger background sync & UI reload
      await triggerPillRefresh();

      // 2. Guarantee a smooth, professional 5-second spin time
      const elapsedTime = Date.now() - startTime;
      const remainingSpinTime = Math.max(0, 5000 - elapsedTime);
      if (remainingSpinTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingSpinTime));
      }

      // 3. Smooth scale-down pop-out exit animation
      setIsHiding(true);
      await new Promise(resolve => setTimeout(resolve, 350));

      // 4. Hide icon completely
      setHasNewUpdates(false);
    } catch (err) {
      console.error('Refresh click error:', err);
      setHasNewUpdates(false);
    } finally {
      setLoading(false);
      setIsHiding(false);
    }
  };

  const isSyncing = loading || isStartupSyncing;

  return (
    <div 
      className={`new-data-icon-container ${isHiding ? 'pop-out' : ''}`} 
      title={isStartupSyncing ? "আপডেট করা হচ্ছে..." : "নতুন পোস্ট যুক্ত হয়েছে • চাপুন"}
    >
      <button 
        className={`new-data-icon-btn ${isSyncing ? 'is-syncing' : ''}`}
        onClick={handleClick}
        disabled={isSyncing || isHiding}
        aria-label={isStartupSyncing ? "Syncing data in progress" : "New data available - click to refresh"}
      >
        <span className={`pulse-glow-ring ${isSyncing ? 'syncing-ring' : ''}`}></span>
        <RefreshCw size={18} className={`new-data-icon-svg ${isSyncing ? 'spinning' : ''}`} />
      </button>
    </div>
  );
}
