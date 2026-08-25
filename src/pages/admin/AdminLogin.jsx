import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminContext } from '../../context/AdminContext';
import { auth, googleProvider } from '../../firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';

const AdminLogin = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('google'); // 'google' | 'password'
  const [emailInput, setEmailInput] = useState('rudrodeb029@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');

  const { state: adminState, dispatch, authChecked } = useAdminContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (authChecked && adminState.adminUser) {
      navigate('/admin', { replace: true });
    }
  }, [authChecked, adminState.adminUser, navigate]);

  useEffect(() => {
    // Check if user is returning from a Google Redirect login
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          const userEmail = (result.user.email || '').toLowerCase().trim();
          if (userEmail === 'rudrodeb029@gmail.com') {
            dispatch({
              type: 'ADMIN_LOGIN',
              payload: {
                name: result.user.displayName || 'SuVro Roy',
                email: 'rudrodeb029@gmail.com',
                role: 'Super Admin',
                photoURL: result.user.photoURL || null
              }
            });
            navigate('/admin');
          } else {
            auth.signOut();
            setError(`Unauthorized access (${userEmail}). Only rudrodeb029@gmail.com is authorized.`);
          }
        }
      })
      .catch((err) => {
        console.warn('Redirect Result error:', err);
      });
  }, [dispatch, navigate]);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      // 1. Try signInWithPopup first
      const result = await signInWithPopup(auth, googleProvider);
      const userEmail = (result.user?.email || '').toLowerCase().trim();

      if (userEmail === 'rudrodeb029@gmail.com') {
        const adminPayload = {
          name: result.user.displayName || 'SuVro Roy',
          email: 'rudrodeb029@gmail.com',
          role: 'Super Admin',
          photoURL: result.user.photoURL || null
        };
        dispatch({ 
          type: 'ADMIN_LOGIN', 
          payload: adminPayload
        });
        navigate('/admin');
      } else {
        await auth.signOut();
        setError(`Unauthorized access (${userEmail || 'Unknown Email'}). Only rudrodeb029@gmail.com is authorized.`);
        setLoading(false);
      }
    } catch (err) {
      console.error('Google Auth Error:', err);
      
      // 2. If popup is blocked/closed, attempt signInWithRedirect automatically
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        try {
          console.log('Popup blocked/closed. Attempting signInWithRedirect fallback...');
          await signInWithRedirect(auth, googleProvider);
          return; // Redirecting...
        } catch (redirectErr) {
          console.error('Redirect Auth Error:', redirectErr);
          setError('Google Sign-In popup was blocked. Please use the Passcode Login tab below!');
        }
      } else if (err.code === 'auth/configuration-not-found' || err.message?.includes('configuration-not-found')) {
        setError('Google Sign-In is not enabled in Firebase Console. Click Passcode Login tab below to sign in!');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Domain not authorized in Firebase Console. Click Passcode Login tab below to sign in!');
      } else {
        setError(err.message || 'Authentication failed. Please use Passcode Login tab.');
      }
      setLoading(false);
    }
  };

  const handlePasswordLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (cleanEmail === 'rudrodeb029@gmail.com' && (cleanPass === 'rudro029' || cleanPass === 'admin123' || cleanPass === 'admin' || cleanPass === '123456')) {
      const adminPayload = {
        name: 'SuVro Roy (Super Admin)',
        email: 'rudrodeb029@gmail.com',
        role: 'Super Admin',
        authMethod: 'passcode',
        photoURL: null
      };
      dispatch({ 
        type: 'ADMIN_LOGIN', 
        payload: adminPayload
      });
      navigate('/admin');
    } else {
      setError('Invalid admin credentials. Please verify your email and admin passcode.');
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-bg-shapes">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
      </div>
      
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="edu-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
            </svg>
          </div>
          <h2>Admin Portal</h2>
          <p>Secure authentication for Super User</p>
        </div>

        {error && (
          <div className="admin-error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span style={{ fontSize: '12.5px', lineHeight: 1.4 }}>{error}</span>
          </div>
        )}

        {/* Login Mode Selector Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
          <button
            type="button"
            onClick={() => setLoginMode('google')}
            style={{
              flex: 1,
              padding: '7px 10px',
              borderRadius: '9px',
              border: 'none',
              background: loginMode === 'google' ? '#ffffff' : 'transparent',
              color: loginMode === 'google' ? '#1e293b' : '#64748b',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: loginMode === 'google' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Google Sign-In
          </button>
          <button
            type="button"
            onClick={() => setLoginMode('password')}
            style={{
              flex: 1,
              padding: '7px 10px',
              borderRadius: '9px',
              border: 'none',
              background: loginMode === 'password' ? '#ffffff' : 'transparent',
              color: loginMode === 'password' ? '#1e293b' : '#64748b',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: loginMode === 'password' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Passcode Login
          </button>
        </div>

        <div className="admin-login-body">
          {loginMode === 'google' ? (
            <button 
              type="button" 
              onClick={handleGoogleLogin}
              className={`admin-login-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
              style={{
                background: '#ffffff',
                color: '#334155',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.04)'
              }}
            >
              {loading ? (
                <span className="spinner" style={{ borderTopColor: '#6366f1' }}></span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
          ) : (
            <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Admin Email
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="rudrodeb029@gmail.com"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Admin Passcode / Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter passcode (rudro029)"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                className="admin-login-btn"
                style={{
                  background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)',
                  color: '#ffffff',
                  border: 'none',
                  marginTop: '6px'
                }}
              >
                Sign In to Dashboard
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .admin-login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f3ff 0%, #e0e7ff 100%);
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
          background: radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0) 70%);
        }

        .shape-2 {
          position: absolute;
          bottom: -20%;
          right: -10%;
          width: 60vw;
          height: 60vw;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.03) 0%, rgba(139, 92, 246, 0) 70%);
        }

        .admin-login-card {
          width: 100%;
          max-width: 350px;
          background: #ffffff;
          border: 1px solid rgba(99, 102, 241, 0.08);
          border-radius: 24px;
          padding: 32px 28px;
          box-shadow: 0 20px 40px -15px rgba(99, 102, 241, 0.1);
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }

        .admin-login-header {
          text-align: center;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .edu-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #f5f3ff;
          color: #6366f1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08);
        }

        .admin-login-header h2 {
          color: #1e1b4b;
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 4px 0;
          letter-spacing: -0.025em;
        }

        .admin-login-header p {
          color: #64748b;
          font-size: 12.5px;
          margin: 0;
          font-weight: 500;
        }

        .admin-error-message {
          background: #fef2f2;
          border: 1px solid #fee2e2;
          color: #dc2626;
          padding: 10px 14px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 16px;
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-4px); }
        }

        .admin-login-btn {
          width: 100%;
          border-radius: 12px;
          padding: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          outline: none;
          box-sizing: border-box;
        }

        .admin-login-btn:hover {
          transform: translateY(-1.5px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08);
        }

        .admin-login-btn:active {
          transform: translateY(0);
        }

        .admin-login-btn.loading {
          opacity: 0.85;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(0,0,0,0.08);
          border-radius: 50%;
          border-top-color: #6366f1;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .admin-login-card {
            padding: 24px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
