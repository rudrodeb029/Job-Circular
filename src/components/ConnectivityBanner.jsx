import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, X } from './Icons';

export default function ConnectivityBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerType, setBannerType] = useState(null); // 'online' or 'offline'

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setBannerType('online');
      setShowBanner(true);
      // Auto-hide online banner after 3 seconds
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setBannerType('offline');
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  const isBackOnline = bannerType === 'online';

  return (
    <div style={{
      position: 'fixed',
      top: 'calc(var(--safe-area-top) + 60px)',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      width: '90%',
      maxWidth: '380px',
      animation: 'modernFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div style={{
        background: isBackOnline ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
        backdropFilter: 'blur(8px)',
        color: 'white',
        padding: '10px 16px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {isBackOnline ? <Wifi size={18} color="white" /> : <WifiOff size={18} color="white" />}
        </div>

        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '13px', fontWeight: 800, margin: 0 }}>
            {isBackOnline ? 'Back Online' : 'No internet'}
          </h4>
        </div>

        {!isBackOnline && (
          <button
            onClick={() => setShowBanner(false)}
            style={{
              padding: '4px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={14} color="white" />
          </button>
        )}
      </div>
    </div>
  );
}
