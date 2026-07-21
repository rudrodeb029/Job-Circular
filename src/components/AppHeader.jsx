import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Search, Globe, Bell, User, X, Home, LayoutGrid, Bookmark, FileText, Settings, Moon, Sun } from './Icons';
import { useAppContext } from '../context/AppContext';
import { notifications } from '../data/notifications';

export default function AppHeader() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const unreadCount = notifications.filter(n => !state.readNotifications.includes(n.id)).length;

  return (
    <>
      {/* Top Header Bar (BBC News Inspired Header Design) */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.9)',
        boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px',
        margin: '-12px -14px 14px -14px'
      }}>
        {/* Left: Hamburger Menu Icon Button */}
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open Menu"
          className={`hamburger-btn ${drawerOpen ? 'open' : ''}`}
        >
          <Menu size={20} className="hamburger-icon" />
        </button>

        {/* Center: Polished Brand Logo Badge (BBC News Inspired Style) */}
        <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)',
            color: 'white',
            padding: '3px 7px',
            borderRadius: '5px',
            fontWeight: 900,
            fontSize: '13.5px',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 6px rgba(26, 86, 219, 0.3)'
          }}>
            JOB
          </div>
          <span style={{
            fontWeight: 900,
            fontSize: '16px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.4px'
          }}>
            CIRCULAR
          </span>
        </Link>

        {/* Right: Action Buttons (Notifications Icon & User Profile Icon) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Notifications Icon Button (Animated Ringing Bell + Pulsing Badge) */}
          <button
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
            title="Notifications"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#1a56db',
              background: 'transparent',
              border: 'none',
              position: 'relative'
            }}
          >
            <Bell size={22} className="bell-animated" color="#1a56db" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '1px',
                  right: '1px',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '9px',
                  fontWeight: '800',
                  width: '15px',
                  height: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid var(--white)',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
                  lineHeight: 1
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar Icon (Dynamic Image / Initial) */}
          <div
            onClick={() => navigate('/profile')}
            title="Profile"
            style={{
              position: 'relative',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)',
              padding: '2px',
              boxShadow: '0 3px 10px rgba(26,86,219,0.25)',
              flexShrink: 0,
              cursor: 'pointer'
            }}
          >
            {state.user.avatar ? (
              <img
                src={state.user.avatar}
                alt={state.user.name}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1a56db 0%, #1e40af 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '15px'
              }}>
                {state.user.name ? state.user.name[0] : 'S'}
              </div>
            )}

            {/* Active Status Dot */}
            <span style={{
              position: 'absolute',
              bottom: '0px',
              right: '0px',
              width: '9px',
              height: '9px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              border: '2px solid white'
            }}></span>
          </div>
        </div>
      </header>

      {/* Side Navigation Drawer Overlay */}
      {drawerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 200,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex'
        }} onClick={() => setDrawerOpen(false)}>
          <div
            style={{
              width: '280px',
              height: '100%',
              background: 'var(--white)',
              boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              padding: '20px 16px',
              animation: 'slideInRight 0.3s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {state.user.avatar ? (
                  <img
                    src={state.user.avatar}
                    alt={state.user.name}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--primary)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '17px'
                  }}>
                    {state.user.name ? state.user.name[0] : 'S'}
                  </div>
                )}
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{state.user.name}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{state.user.email}</p>
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{ padding: '6px', color: 'var(--text-muted)', border: 'none', background: 'transparent' }}>
                <X size={22} />
              </button>
            </div>

            {/* Drawer Menu Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <Link to="/home" onClick={() => setDrawerOpen(false)} className="menu-item" style={{ borderRadius: '10px' }}>
                <div className="menu-item-icon"><Home size={20} /></div>
                <span className="menu-item-label">Home</span>
              </Link>
              <Link to="/categories" onClick={() => setDrawerOpen(false)} className="menu-item" style={{ borderRadius: '10px' }}>
                <div className="menu-item-icon"><LayoutGrid size={20} /></div>
                <span className="menu-item-label">Categories</span>
              </Link>
              <Link to="/saved" onClick={() => setDrawerOpen(false)} className="menu-item" style={{ borderRadius: '10px' }}>
                <div className="menu-item-icon"><Bookmark size={20} /></div>
                <span className="menu-item-label">Saved Jobs</span>
              </Link>
              <Link to="/admit-card" onClick={() => setDrawerOpen(false)} className="menu-item" style={{ borderRadius: '10px' }}>
                <div className="menu-item-icon"><FileText size={20} /></div>
                <span className="menu-item-label">Admit Card & Result</span>
              </Link>
              <Link to="/notifications" onClick={() => setDrawerOpen(false)} className="menu-item" style={{ borderRadius: '10px' }}>
                <div className="menu-item-icon"><Bell size={20} /></div>
                <span className="menu-item-label">Notifications</span>
              </Link>
              <Link to="/profile" onClick={() => setDrawerOpen(false)} className="menu-item" style={{ borderRadius: '10px' }}>
                <div className="menu-item-icon"><User size={20} /></div>
                <span className="menu-item-label">Profile</span>
              </Link>
              <Link to="/settings" onClick={() => setDrawerOpen(false)} className="menu-item" style={{ borderRadius: '10px' }}>
                <div className="menu-item-icon"><Settings size={20} /></div>
                <span className="menu-item-label">Settings</span>
              </Link>
            </div>

            {/* Dark Mode Quick Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'var(--bg-secondary)',
              borderRadius: '12px',
              marginTop: 'auto'
            }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Dark Mode</span>
              <button onClick={() => dispatch({ type: 'TOGGLE_THEME' })} style={{ color: 'var(--primary)', border: 'none', background: 'transparent' }}>
                {state.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
