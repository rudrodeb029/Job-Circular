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
    <div className="splash">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="animate-scale-in">
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          padding: '20px',
          borderRadius: 'var(--radius-full)',
          marginBottom: 'var(--space-lg)',
          backdropFilter: 'blur(8px)'
        }}>
          <Briefcase size={48} />
        </div>
        <h1 className="splash-logo">Job Circular</h1>
        <p className="splash-tagline">সব চাকরির খবর, সবার আগে</p>
      </div>
      <p className="splash-footer">Made in Bangladesh 🇧🇩</p>
    </div>
  );
}
