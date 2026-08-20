import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Shield, FileText, Share2, Star, Mail, Info, ChevronRight } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import BottomNav from '../components/BottomNav';

const TrashIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

export default function Settings() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';

  const items = [
    { 
      icon: User, 
      label: isEn ? 'Account Settings' : 'অ্যাকাউন্ট সেটিংস', 
      path: '/edit-profile',
      gradient: 'linear-gradient(135deg, #1a56db, #3b82f6)'
    },
    { 
      icon: Shield, 
      label: isEn ? 'Privacy Policy' : 'প্রাইভেসি পলিসি', 
      path: '/privacy',
      gradient: 'linear-gradient(135deg, #10b981, #059669)'
    },
    { 
      icon: FileText, 
      label: isEn ? 'Terms & Conditions' : 'শর্তাবলী ও নীতিমালা', 
      path: '/terms',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
    },
    { 
      icon: Share2, 
      label: isEn ? 'Share App' : 'অ্যাপ শেয়ার করুন', 
      path: '/share',
      gradient: 'linear-gradient(135deg, #ec4899, #db2777)'
    },
    { 
      icon: Star, 
      label: isEn ? 'Rate Us' : 'রেট দিন', 
      path: '/rate',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    },
    { 
      icon: Mail, 
      label: isEn ? 'Contact Us' : 'যোগাযোগ করুন', 
      path: '/contact',
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)'
    },
    { 
      icon: Info, 
      label: isEn ? 'About App' : 'অ্যাপ সম্পর্কে', 
      path: '/about',
      gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)'
    },
    { 
      icon: TrashIcon, 
      label: isEn ? 'Delete Account & Data' : 'অ্যাকাউন্ট ও ডাটা মুছুন', 
      key: 'delete',
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)'
    }
  ];

  const handleDeleteAccount = () => {
    const isConfirm = window.confirm(
      isEn 
        ? "Are you sure you want to delete your profile and all local data? This action cannot be undone."
        : "আপনি কি নিশ্চিত যে আপনার প্রোফাইল এবং সমস্ত লোকাল ডাটা মুছে ফেলতে চান? এই অ্যাকশনটি আর ফিরিয়ে আনা যাবে না।"
    );
    if (isConfirm) {
      localStorage.clear();
      navigate('/');
      window.location.reload();
    }
  };

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <div className="page-header" style={{ borderBottom: '1px solid var(--border-light)' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1, fontSize: 'var(--text-lg)', fontWeight: 800 }}>
          {isEn ? 'Settings' : 'সেটিংস'}
        </h1>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '20px 16px' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-light)', borderRadius: '18px', boxShadow: 'var(--shadow-sm)' }}>
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
                borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--border-light)',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div className="menu-item-icon" style={{
                background: item.gradient,
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <item.icon size={16} />
              </div>
              <span className="menu-item-label" style={{
                flex: 1,
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
                color: item.key === 'delete' ? 'var(--danger)' : 'var(--text-primary)'
              }}>
                {item.label}
              </span>
              <ChevronRight size={15} className="menu-item-arrow" style={{ opacity: 0.6 }} />
            </div>
          ))}
        </div>

        <p className="text-center text-muted" style={{ marginTop: 'var(--space-2xl)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
          {isEn ? 'App Version' : 'অ্যাপ সংস্করণ'} 1.0.0
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
