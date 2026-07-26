import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      background: '#FFFFFF',
      position: 'relative'
    }}>
      <div className="animate-scale-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '120px',
          height: '120px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img
            src="/app-logo.png"
            alt="Job Circular BD"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>
    </div>
  );
}
