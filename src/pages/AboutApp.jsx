import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Briefcase } from '../components/Icons';
import Disclaimer from '../components/Disclaimer';
import BottomNav from '../components/BottomNav';

export default function AboutApp() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1>About App</h1>
      </div>

      <div className="page-content animate-fade-in">
        <div className="card" style={{ textAlign: 'center', padding: '32px 20px', marginBottom: '20px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)',
            borderRadius: '20px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 8px 24px rgba(26,86,219,0.2)'
          }}>
            <Briefcase size={40} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Job Circular</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>Version 1.0.0 (Build 2026.07)</p>

          <div style={{ marginTop: '24px', textAlign: 'left' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong>Job Circular</strong> is Bangladesh's premier platform offering up-to-the-minute recruitment notices from the Government, Banks, NGOs, and the Private Sector.
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '12px', fontStyle: 'italic' }}>
              জব সার্কুলার অ্যাপের মাধ্যমে সকল সরকারি চাকরি, ব্যাংকের চাকরি, প্রাইভেট সেক্টরের নিয়োগ এবং বিভিন্ন গুরুত্বপূর্ণ পরীক্ষার প্রবেশপত্র ও ফলাফল পাবেন সবার আগে, এক জায়গায়।
            </p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '4px', height: '16px', background: 'var(--primary)', borderRadius: '2px' }}></div>
            Key Features
          </h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { t: 'Real-time push alerts for new circulars', icon: '🔔' },
              { t: 'Download notices offline with 1-click', icon: '📥' },
              { t: 'Interactive sector-wise search filters', icon: '🔍' },
              { t: 'Built-in candidate profile management', icon: '👤' }
            ].map((f, i) => (
              <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span style={{ fontSize: '18px' }}>{f.icon}</span>
                {f.t}
              </li>
            ))}
          </ul>
        </div>

        <Disclaimer />
      </div>
      <BottomNav />
    </div>
  );
}
