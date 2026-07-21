import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WifiOff, AlertCircle } from './Icons';

export function NoInternet({ onRetry }) {
  return (
    <div className="error-page">
      <div style={{
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        background: 'var(--primary-lightest)',
        color: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 'var(--space-lg)'
      }}>
        <WifiOff size={48} />
      </div>
      <h2 className="error-title">No Internet Connection</h2>
      <p className="error-desc">Please check your internet connection and try again.</p>
      <button className="btn btn-primary" onClick={onRetry || (() => window.location.reload())}>
        Retry
      </button>
    </div>
  );
}

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <h1 className="error-code">404</h1>
      <h2 className="error-title">Page Not Found</h2>
      <p className="error-desc">The page you are looking for was not found or has been moved.</p>
      <button className="btn btn-primary" onClick={() => navigate('/home')}>
        Go Home
      </button>
    </div>
  );
}

export default NotFoundPage;
