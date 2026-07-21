import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminContext } from '../../context/AdminContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { dispatch } = useAdminContext();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (email === 'admin@jobcircular.com' && password === 'admin123') {
        dispatch({ 
          type: 'ADMIN_LOGIN', 
          payload: { name: 'Admin', email: 'admin@jobcircular.com', role: 'Super Admin' } 
        });
        navigate('/admin');
      } else {
        setError('Invalid admin credentials');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-bg-shapes">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
      </div>
      
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <h2>Admin Portal</h2>
          <p>Sign in to manage jobs and candidates</p>
        </div>

        {error && (
          <div className="admin-error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="admin-email">Email Address</label>
            <div className="admin-input-wrapper">
              <span className="admin-input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jobcircular.com"
                required
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="admin-password">Password</label>
            <div className="admin-input-wrapper">
              <span className="admin-input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={`admin-login-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <>
                Sign In to Dashboard
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <Link to="/" className="back-to-app">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Application
          </Link>
        </div>
      </div>

      <style>{`
        .admin-login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f4ff;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          padding: 20px;
        }

        .admin-login-bg-shapes {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }

        .shape-1 {
          position: absolute;
          top: -10%;
          left: -10%;
          width: 50vw;
          height: 50vw;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(26,86,219,0.08) 0%, rgba(26,86,219,0) 70%);
        }

        .shape-2 {
          position: absolute;
          bottom: -20%;
          right: -10%;
          width: 60vw;
          height: 60vw;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(26,86,219,0.05) 0%, rgba(26,86,219,0) 70%);
        }

        .admin-login-card {
          width: 100%;
          max-width: 440px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 48px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          position: relative;
          z-index: 1;
        }

        .admin-login-header {
          text-align: center;
          margin-bottom: 36px;
        }

        .admin-logo-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #1a56db, #2563eb);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: white;
          box-shadow: 0 10px 25px rgba(37,99,235,0.3);
        }

        .admin-login-header h2 {
          color: #1e293b;
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .admin-login-header p {
          color: #64748b;
          font-size: 15px;
          margin: 0;
        }

        .admin-error-message {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 14px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 24px;
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }

        .admin-form-group {
          margin-bottom: 24px;
        }

        .admin-form-group label {
          display: block;
          color: #1e293b;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .admin-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .admin-input-icon {
          position: absolute;
          left: 16px;
          color: #94a3b8;
          display: flex;
        }

        .admin-input-wrapper input {
          width: 100%;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px 16px 14px 48px;
          color: #1e293b;
          font-size: 15px;
          transition: all 0.2s ease;
          outline: none;
          box-sizing: border-box;
        }

        .admin-input-wrapper input::placeholder {
          color: #94a3b8;
        }

        .admin-input-wrapper input:focus {
          background: #ffffff;
          border-color: #1a56db;
          box-shadow: 0 0 0 4px rgba(26,86,219,0.1);
        }

        .admin-input-wrapper input:focus + .admin-input-icon,
        .admin-input-wrapper input:focus ~ .admin-input-icon {
          color: #1a56db;
        }

        .admin-login-btn {
          width: 100%;
          background: linear-gradient(135deg, #1a56db, #2563eb);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 10px 25px rgba(37,99,235,0.3);
          margin-top: 32px;
        }

        .admin-login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(37,99,235,0.4);
        }

        .admin-login-btn:active {
          transform: translateY(0);
        }

        .admin-login-btn.loading {
          opacity: 0.9;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .admin-login-footer {
          margin-top: 32px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          padding-top: 24px;
        }

        .back-to-app {
          color: #64748b;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: color 0.2s ease;
        }

        .back-to-app:hover {
          color: #1a56db;
        }

        @media (max-width: 480px) {
          .admin-login-card {
            padding: 32px 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
