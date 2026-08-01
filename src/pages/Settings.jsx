import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Shield, FileText, Share2, Star, Mail, Info, ChevronRight } from '../components/Icons';
import BottomNav from '../components/BottomNav';

const TrashIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

export default function Settings() {
  const navigate = useNavigate();

  const items = [
    { icon: User, label: 'Account Settings', path: '/edit-profile' },
    { icon: Shield, label: 'Privacy Policy', path: '/privacy' },
    { icon: FileText, label: 'Terms & Conditions', path: '/terms' },
    { icon: Share2, label: 'Share App', path: '/share' },
    { icon: Star, label: 'Rate Us', path: '/rate' },
    { icon: Mail, label: 'Contact Us', path: '/contact' },
    { icon: Info, label: 'About App', path: '/about' },
    { icon: TrashIcon, label: 'Delete Account & Data', key: 'delete' }
  ];

  const handleDeleteAccount = () => {
    const isConfirm = window.confirm(
      "Are you sure you want to delete your profile and all local data? This action cannot be undone.\n\nআপনি কি আপনার প্রোফাইল এবং সকল তথ্য মুছে ফেলতে চান?"
    );
    if (isConfirm) {
      localStorage.clear();
      navigate('/');
      window.location.reload();
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1>Settings</h1>
      </div>

      <div className="page-content animate-fade-in">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {items.map((item, i) => (
            <div 
              key={i} 
              className="menu-item"
              onClick={() => {
                if (item.key === 'delete') {
                  handleDeleteAccount();
                } else {
                  navigate(item.path);
                }
              }}
              style={{
                cursor: 'pointer',
                color: item.key === 'delete' ? 'var(--danger)' : 'inherit',
                borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--border-light)'
              }}
            >
              <div className="menu-item-icon" style={{
                background: item.key === 'delete' ? 'rgba(239, 68, 68, 0.1)' : 'var(--primary-lightest)',
                color: item.key === 'delete' ? 'var(--danger)' : 'var(--primary)'
              }}>
                <item.icon size={20} />
              </div>
              <span className="menu-item-label" style={{
                fontWeight: item.key === 'delete' ? 700 : 500,
                fontSize: '13px'
              }}>
                {item.label}
              </span>
              <ChevronRight size={18} className="menu-item-arrow" />
            </div>
          ))}
        </div>

        <p className="text-center text-muted" style={{ marginTop: 'var(--space-xl)', fontSize: 'var(--text-sm)' }}>
          App Version 1.0.0
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
