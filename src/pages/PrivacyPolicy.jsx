import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from '../components/Icons';
import BottomNav from '../components/BottomNav';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      {/* Modern Gradient Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1a56db 50%, #2563eb 100%)',
        padding: 'calc(var(--safe-area-top) + 14px) 20px 20px 20px',
        color: 'white',
        borderRadius: '0 0 20px 20px',
        boxShadow: '0 8px 24px -4px rgba(26, 86, 219, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(8px)',
            color: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '19px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
          Privacy Policy
        </h1>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '20px' }}>
        <div className="card" style={{ marginBottom: '20px', borderTop: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '10px', background: 'var(--primary-bg)', borderRadius: '12px', color: 'var(--primary)' }}>
              <Shield size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Privacy & Data</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last updated: July 2026</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <section>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                1. Data Collection / তথ্য সংগ্রহ
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                We collect your profile details (name, email, educational qualification, and target job category) locally to personalize your job feed and matching alerts.
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '8px', fontStyle: 'italic' }}>
                আমরা আপনার প্রোফাইলের বিবরণ (নাম, ইমেল, শিক্ষাগত যোগ্যতা এবং লক্ষ্যযুক্ত চাকুরির ক্যাটাগরি) আপনার জন্য উপযুক্ত চাকুরির খবর দেখানোর জন্য সংরক্ষণ করি।
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                2. Permissions / পারমিশন
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                The app requests storage permissions to allow downloading circular images, and notification permissions to alert you about new jobs and upcoming deadlines.
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '8px', fontStyle: 'italic' }}>
                চাকুরির বিজ্ঞপ্তির ছবি ডাউনলোড করার জন্য স্টোরেজ পারমিশন এবং নতুন চাকুরির অ্যালার্ট পাওয়ার জন্য নোটিফিকেশন পারমিশন প্রয়োজন।
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                3. Security / নিরাপত্তা
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Your data is stored securely in local storage and is never shared with third parties. We value your privacy and ensure that all personal information remains on your device.
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '8px', fontStyle: 'italic' }}>
                আপনার তথ্য সম্পূর্ণ সুরক্ষিত রাখা হয় এবং কোনো তৃতীয় পক্ষের সাথে শেয়ার করা হয় না।
              </p>
            </section>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
