import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from '../components/Icons';
import { useAppContext } from '../context/AppContext';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { state } = useAppContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.hasSeenOnboarding) {
        navigate('/home', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate, state.hasSeenOnboarding]);

  return (
    <div className="splash" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--bg)',
      position: 'relative'
    }}>
      <div className="animate-scale-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 32 32" style={{
          filter: 'drop-shadow(0 15px 35px rgba(26, 86, 219, 0.3))'
        }}>
          <rect width="32" height="32" rx="9" fill="url(#logo-grad)"/>
          <defs>
            <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#2563eb" />
              <stop offset="100%" stop-color="#1d4ed8" />
            </linearGradient>
          </defs>
          <text x="16" y="22.5" text-anchor="middle" fill="white" font-family="'Outfit', 'Inter', system-ui, sans-serif" font-size="15" font-weight="900" letter-spacing="-0.5px">JC</text>
        </svg>
      </div>
    </div>
  );
}
