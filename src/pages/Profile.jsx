import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Bookmark, Briefcase, FileText, Bell, Globe, Moon, Sun, Settings, ChevronRight } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import BottomNav from '../components/BottomNav';
import EditProfileModal from '../components/EditProfileModal';

export default function Profile() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const toggleLanguage = () => {
    const nextLang = state.language === 'bn' ? 'en' : 'bn';
    dispatch({ type: 'SET_LANGUAGE', payload: nextLang });
  };

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      {/* Glassmorphism Gradient Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1a56db 50%, #2563eb 100%)',
        padding: '36px 20px 60px 20px',
        color: 'white',
        textAlign: 'center',
        borderRadius: '0 0 28px 28px',
        position: 'relative',
        boxShadow: '0 10px 30px -5px rgba(26, 86, 219, 0.35)',
        overflow: 'hidden'
      }}>
        {/* Background Decorative Rings */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          pointerEvents: 'none'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none'
        }}></div>

        {/* Top Right Settings Gear Button */}
        <button
          onClick={() => navigate('/settings')}
          title="Settings"
          aria-label="Settings"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(8px)',
            color: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Settings size={20} />
        </button>

        {/* Avatar with Ring & Edit Camera Trigger Badge */}
        <div style={{
          position: 'relative',
          width: '84px',
          height: '84px',
          margin: '0 auto 14px auto'
        }}>
          {state.user.avatar ? (
            <img
              src={state.user.avatar}
              alt={state.user.name}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3.5px solid rgba(255, 255, 255, 0.85)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffffff 0%, #dbeafe 100%)',
              color: '#1a56db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 800,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
              border: '3.5px solid rgba(255, 255, 255, 0.85)'
            }}>
              {state.user.name ? state.user.name[0] : 'S'}
            </div>
          )}

          {/* Edit Camera Badge */}
          <div
            onClick={() => setIsEditModalOpen(true)}
            title="Edit Profile & Picture"
            style={{
              position: 'absolute',
              bottom: '0px',
              right: '0px',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '2.5px solid white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}
          >
            <Edit size={12} />
          </div>
        </div>

        {/* User Info */}
        <h2 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.3px', marginBottom: '4px' }}>
          {state.user.name}
        </h2>
        <span style={{
          display: 'inline-block',
          fontSize: '12px',
          background: 'rgba(255, 255, 255, 0.16)',
          backdropFilter: 'blur(4px)',
          padding: '3px 12px',
          borderRadius: '20px',
          color: 'rgba(255, 255, 255, 0.95)',
          fontWeight: 500
        }}>
          {state.user.email}
        </span>
      </div>

      {/* Floating Activity Stats Bar */}
      <div style={{
        padding: '0 20px',
        marginTop: '-32px',
        marginBottom: '20px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          background: 'var(--white)',
          padding: '14px 10px',
          borderRadius: '20px',
          boxShadow: '0 8px 25px -4px rgba(15, 23, 42, 0.08)',
          border: '1px solid var(--border-light)'
        }}>
          <div
            onClick={() => navigate('/saved')}
            style={{ textAlign: 'center', cursor: 'pointer', flex: 1 }}
          >
            <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>
              {state.savedJobs.length}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
              Saved Jobs
            </p>
          </div>
          <div style={{ width: '1px', height: '28px', background: 'var(--border-light)' }}></div>
          <div
            onClick={() => navigate('/saved')}
            style={{ textAlign: 'center', cursor: 'pointer', flex: 1 }}
          >
            <p style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>
              {state.appliedJobs.length}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
              Applied
            </p>
          </div>
          <div style={{ width: '1px', height: '28px', background: 'var(--border-light)' }}></div>
          <div
            onClick={() => navigate('/notifications')}
            style={{ textAlign: 'center', cursor: 'pointer', flex: 1 }}
          >
            <p style={{ fontSize: '18px', fontWeight: 800, color: '#ea580c' }}>
              {state.readNotifications.length}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
              Notified
            </p>
          </div>
        </div>
      </div>

      <div className="page-content" style={{ padding: '0 20px 80px 20px' }}>
        {/* Section 1: Account & Activity */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', paddingLeft: '4px' }}>
            <div style={{ width: '4px', height: '16px', borderRadius: '3px', background: 'var(--primary)' }}></div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
              Account & Activity
            </h3>
          </div>

          <div style={{
            background: 'var(--white)',
            borderRadius: '20px',
            border: '1px solid var(--border-light)',
            boxShadow: '0 4px 18px -2px rgba(15, 23, 42, 0.04)',
            overflow: 'hidden'
          }}>
            {/* Edit Profile Action */}
            <div
              className="menu-item"
              onClick={() => setIsEditModalOpen(true)}
              style={{ borderBottom: '1px solid var(--border-light)' }}
            >
              <div className="menu-item-icon" style={{ background: 'linear-gradient(135deg, #1a56db, #3b82f6)', color: 'white', borderRadius: '12px' }}>
                <Edit size={18} />
              </div>
              <span className="menu-item-label" style={{ fontWeight: 700 }}>Edit Profile</span>
              <ChevronRight size={18} className="menu-item-arrow" />
            </div>

            {/* Saved Jobs */}
            <div className="menu-item" onClick={() => navigate('/saved')} style={{ borderBottom: '1px solid var(--border-light)' }}>
              <div className="menu-item-icon" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: 'white', borderRadius: '12px' }}>
                <Bookmark size={18} />
              </div>
              <span className="menu-item-label" style={{ fontWeight: 700 }}>Saved Jobs</span>
              <ChevronRight size={18} className="menu-item-arrow" />
            </div>

            {/* Applied Jobs */}
            <div className="menu-item" onClick={() => navigate('/saved')} style={{ borderBottom: '1px solid var(--border-light)' }}>
              <div className="menu-item-icon" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', borderRadius: '12px' }}>
                <Briefcase size={18} />
              </div>
              <span className="menu-item-label" style={{ fontWeight: 700 }}>Applied Jobs</span>
              <ChevronRight size={18} className="menu-item-arrow" />
            </div>

            {/* Admit Card & Result */}
            <div className="menu-item" onClick={() => navigate('/admit-card')}>
              <div className="menu-item-icon" style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', color: 'white', borderRadius: '12px' }}>
                <FileText size={18} />
              </div>
              <span className="menu-item-label" style={{ fontWeight: 700 }}>Admit Card & Result</span>
              <ChevronRight size={18} className="menu-item-arrow" />
            </div>
          </div>
        </div>

        {/* Section 2: Preferences & System */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', paddingLeft: '4px' }}>
            <div style={{ width: '4px', height: '16px', borderRadius: '3px', background: 'var(--primary)' }}></div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
              Preferences & System
            </h3>
          </div>

          <div style={{
            background: 'var(--white)',
            borderRadius: '20px',
            border: '1px solid var(--border-light)',
            boxShadow: '0 4px 18px -2px rgba(15, 23, 42, 0.04)',
            overflow: 'hidden'
          }}>
            {/* Notification Settings */}
            <div className="menu-item" onClick={() => navigate('/notifications')} style={{ borderBottom: '1px solid var(--border-light)' }}>
              <div className="menu-item-icon" style={{ background: 'linear-gradient(135deg, #0284c7, #06b6d4)', color: 'white', borderRadius: '12px' }}>
                <Bell size={18} />
              </div>
              <span className="menu-item-label" style={{ fontWeight: 700 }}>Notification Settings</span>
              <ChevronRight size={18} className="menu-item-arrow" />
            </div>

            {/* Language Switcher */}
            <div className="menu-item" onClick={toggleLanguage} style={{ borderBottom: '1px solid var(--border-light)' }}>
              <div className="menu-item-icon" style={{ background: 'linear-gradient(135deg, #db2777, #ec4899)', color: 'white', borderRadius: '12px' }}>
                <Globe size={18} />
              </div>
              <span className="menu-item-label" style={{ fontWeight: 700 }}>App Language</span>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                background: 'var(--primary-bg)',
                color: 'var(--primary)',
                padding: '4px 10px',
                borderRadius: '12px',
                marginRight: '6px'
              }}>
                {state.language === 'bn' ? 'বাংলা (BN)' : 'English (EN)'}
              </span>
              <ChevronRight size={18} className="menu-item-arrow" />
            </div>

            {/* Dark Mode Toggle */}
            <div className="menu-item" onClick={() => dispatch({ type: 'TOGGLE_THEME' })}>
              <div className="menu-item-icon" style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white', borderRadius: '12px' }}>
                {state.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </div>
              <span className="menu-item-label" style={{ fontWeight: 700 }}>Dark Mode</span>
              <div className={`toggle ${state.theme === 'dark' ? 'active' : ''}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Interactive Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      <BottomNav />
    </div>
  );
}
