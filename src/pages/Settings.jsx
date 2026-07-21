import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Shield, FileText, Share2, Star, Mail, Info, ChevronRight } from '../components/Icons';
import BottomNav from '../components/BottomNav';

export default function Settings() {
  const navigate = useNavigate();

  const items = [
    { icon: User, label: 'Account Settings' },
    { icon: Shield, label: 'Privacy Policy' },
    { icon: FileText, label: 'Terms & Conditions' },
    { icon: Share2, label: 'Share App' },
    { icon: Star, label: 'Rate Us' },
    { icon: Mail, label: 'Contact Us' },
    { icon: Info, label: 'About App' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1>Settings</h1>
      </div>

      <div className="page-content">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {items.map((item, i) => (
            <div key={i} className="menu-item">
              <div className="menu-item-icon">
                <item.icon size={20} />
              </div>
              <span className="menu-item-label">{item.label}</span>
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
