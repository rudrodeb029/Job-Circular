import React, { useState } from 'react';
import { RefreshCw } from './Icons';
import { useAppContext } from '../context/AppContext';

export default function NewDataIcon() {
  const { hasNewUpdates, triggerPillRefresh } = useAppContext();
  const [loading, setLoading] = useState(false);

  if (!hasNewUpdates) return null;

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await triggerPillRefresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-data-icon-container" title="নতুন পোস্ট যুক্ত হয়েছে • চাপুন">
      <button 
        className={`new-data-icon-btn ${loading ? 'is-syncing' : ''}`}
        onClick={handleClick}
        aria-label="New data available - click to refresh"
      >
        <span className="pulse-glow-ring"></span>
        <RefreshCw size={18} className={`new-data-icon-svg ${loading ? 'spinning' : ''}`} />
      </button>
    </div>
  );
}
