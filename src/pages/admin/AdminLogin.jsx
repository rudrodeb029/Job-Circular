import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminContext } from '../../context/AdminContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  // Assuming useAdminContext returns { dispatch } based on the requirements
  const { dispatch } = useAdminContext();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Fake authentication delay
    setTimeout(() => {
      if (email === 'admin@jobcircular.com' && password === 'admin123') {
        if (dispatch) {
          dispatch({
            type: 'ADMIN_LOGIN',
            payload: {
              name: 'Admin',
              email: 'admin@jobcircular.com',
              role: 'Super Admin',
            },
          });
        }
        navigate('/admin');
      } else {
        setError('Invalid email or password');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <>
      <style>
        {`
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .admin-login-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #0f172a;
            position: relative;
            overflow: hidden;
            font-family: system-ui, -apple-system, sans-serif;
          }
          .admin-login-gradient {
            position: absolute;
            top: -150px;
            left: 50%;
            transform: translateX(-50%);
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(15, 23, 42, 0) 70%);
            pointer-events: none;
          }
          .admin-login-card {
            background-color: #1e293b;
            border: 1px solid #334155;
            border-radius: 16px;
            max-width: 400px;
            width: 90%;
            padding: 40px;
            position: relative;
            z-index: 1;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            box-sizing: border-box;
          }
          .admin-login-input-group {
            position: relative;
            margin-bottom: 20px;
          }
          .admin-login-input {
            width: 100%;
            background-color: #0f172a;
            border: 1px solid #334155;
            color: #f8fafc;
            border-radius: 8px;
            padding: 12px 12px 12px 40px;
            font-size: 15px;
            transition: all 0.2s ease;
            box-sizing: border-box;
          }
          .admin-login-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
          }
          .admin-login-input::placeholder {
            color: #64748b;
          }
          .admin-input-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #64748b;
            width: 20px;
            height: 20px;
            pointer-events: none;
            transition: color 0.2s ease;
          }
          .admin-login-input:focus ~ .admin-input-icon,
          .admin-login-input:not(:placeholder-shown) ~ .admin-input-icon {
            color: #3b82f6;
          }
          .admin-pwd-toggle {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #64748b;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s ease;
          }
          .admin-pwd-toggle:hover {
            color: #f8fafc;
          }
          .admin-login-btn {
            width: 100%;
            background: linear-gradient(135deg, #2563eb, #3b82f6);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            margin-top: 24px;
            box-sizing: border-box;
          }
          .admin-login-btn:hover:not(:disabled) {
            background: linear-gradient(135deg, #1d4ed8, #2563eb);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
          }
          .admin-login-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          .admin-login-error {
            background-color: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            color: #f87171;
            padding: 12px;
            border-radius: 8px;
            font-size: 14px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
        `}
      </style>

      <div className="admin-login-wrapper">
        <div className="admin-login-gradient"></div>
        
        <div className="admin-login-card">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <h1 style={{ color: '#f8fafc', fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0' }}>Job Circular</h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Admin Panel</p>
          </div>

          {error && (
            <div className="admin-login-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="admin-login-input-group">
              <input
                type="email"
                placeholder="Email address"
                className="admin-login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <svg className="admin-input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>

            <div className="admin-login-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="admin-login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <svg className="admin-input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              
              <button 
                type="button" 
                className="admin-pwd-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>

            <button type="submit" className="admin-login-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg className="admin-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                    <line x1="18" y1="12" x2="22" y2="12"></line>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                  </svg>
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link to="/home" style={{ color: '#94a3b8', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#e2e8f0'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}>
              &larr; Back to App
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
