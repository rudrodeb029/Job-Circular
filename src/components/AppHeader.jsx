import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Bell, X, Home, FileText, Settings, Moon, Sun, ChevronRight } from './Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import { getQuestionsData } from '../data/questionsData';

export default function AppHeader() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { state: adminState } = useAdminContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [questionsMenuOpen, setQuestionsMenuOpen] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const notificationsList = adminState.notifications || [];
  const unreadCount = notificationsList.filter(n => !state.readNotifications.includes(n.id)).length;

  return (
    <>
      <header style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4px',
        marginBottom: '8px',
        background: 'transparent'
      }}>
        {/* Left: Menu Button */}
        <button
          onClick={() => setDrawerOpen(true)}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.02)'
          }}
        >
          <Menu size={20} color="#1e293b" />
        </button>

        {/* Center: Logo */}
        <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
          <div style={{
            background: '#1a56db',
            color: 'white',
            padding: '4px 6px',
            borderRadius: '4px',
            fontWeight: 900,
            fontSize: '13px',
            letterSpacing: '0.5px'
          }}>
            JOB
          </div>
          <span style={{
            fontWeight: 800,
            fontSize: '18px',
            color: '#1e293b',
            letterSpacing: '-0.5px'
          }}>
            CIRCULAR
          </span>
        </Link>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => navigate('/notifications')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              position: 'relative',
              border: 'none'
            }}
          >
            <Bell size={24} color="#94a3b8" />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                fontSize: '8px',
                fontWeight: '800',
                minWidth: '14px',
                height: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #f8faff',
                padding: '0 2px'
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <div
            onClick={() => navigate('/profile')}
            style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#1a56db',
              cursor: 'pointer',
              border: '1.5px solid #ffffff',
              boxShadow: '0 4px 10px rgba(26,86,219,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {state.user.avatar ? (
              <img src={state.user.avatar} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '15px' }}>
                {state.user.name ? state.user.name[0].toUpperCase() : 'S'}
              </div>
            )}
            <span style={{
              position: 'absolute',
              bottom: '1px',
              right: '1px',
              width: '9px',
              height: '9px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              border: '1.5px solid #ffffff'
            }}></span>
          </div>
        </div>
      </header>

      {/* Drawer Overlay */}
      {drawerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 200,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex'
        }} onClick={() => setDrawerOpen(false)}>
          <div
            style={{
              width: '280px',
              height: '100%',
              background: '#ffffff',
              boxShadow: '10px 0 40px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px 20px',
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1a56db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '20px' }}>
                  {state.user.name ? state.user.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>{state.user.name || 'User Name'}</h4>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>{state.language === 'en' ? 'Welcome back!' : 'স্বাগতম!'}</p>
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{ color: '#94a3b8' }}><X size={24} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <Link to="/home" onClick={() => setDrawerOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', textDecoration: 'none', color: '#1e293b', fontWeight: 600, background: '#f8faff' }}>
                <Home size={20} />
                <span>{state.language === 'en' ? 'Home' : 'হোম'}</span>
              </Link>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div 
                  onClick={() => setQuestionsMenuOpen(!questionsMenuOpen)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '12px', cursor: 'pointer', color: '#1e293b', fontWeight: 600 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileText size={20} />
                    <span>{state.language === 'en' ? 'Questions' : 'প্রশ্নপত্র'}</span>
                  </div>
                  <ChevronRight size={16} style={{ transform: questionsMenuOpen ? 'rotate(90deg)' : 'none', transition: '0.2s' }} />
                </div>

                {questionsMenuOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '44px', gap: '12px', marginTop: '4px', marginBottom: '12px' }}>
                    {['BCS', 'Bank', 'NTRCA'].map(item => (
                      <span key={item} style={{ fontSize: '14px', color: '#64748b', fontWeight: 500, cursor: 'pointer' }}>{item}</span>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/settings" onClick={() => setDrawerOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', textDecoration: 'none', color: '#1e293b', fontWeight: 600 }}>
                <Settings size={20} />
                <span>{state.language === 'en' ? 'Settings' : 'সেটিংস'}</span>
              </Link>
            </div>

            <button
              onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8faff', borderRadius: '16px', marginTop: 'auto' }}
            >
              <span style={{ fontWeight: 700, color: '#1e293b' }}>{state.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              {state.theme === 'dark' ? <Sun size={20} color="#1a56db" /> : <Moon size={20} color="#1a56db" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
