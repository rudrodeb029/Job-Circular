import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from '../components/Icons';
import BottomNav from '../components/BottomNav';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="page" style={{ background: 'var(--bg-secondary)' }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ fontSize: '15px', fontWeight: 800 }}>Privacy Policy</h1>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
        <div className="card" style={{ marginBottom: '20px', borderRadius: '24px', borderTop: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '10px', background: 'var(--primary-bg)', borderRadius: '12px', color: 'var(--primary)' }}>
              <Shield size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Privacy & Data Security</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Last updated: July 2026</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                1. Information We Collect
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                We collect information you provide directly to us when creating a profile, including your name, educational qualification, district location, and target job categories. We also collect activity data such as saved job circulars, applied jobs, and feedback messages you send to our support team.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                2. Data Synchronization & Storage
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Your profile and activity data are synchronized with our secure backend (Supabase) to ensure your information is backed up and can be restored if you reinstall the app. We also use high-performance local caching to store job data on your device for instant offline access.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                3. Push Notifications
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                We use OneSignal to send real-time alerts about new job circulars, exam dates, and results. These services may collect unique device identifiers to deliver notifications effectively. You can opt-out of these notifications at any time through the app settings.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                4. Third-Party Services
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Our application utilizes trusted third-party services to enhance performance:
              </p>
              <ul style={{ paddingLeft: '18px', marginTop: '6px', fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><strong>Supabase:</strong> For secure database storage and real-time data sync.</li>
                <li><strong>Cloudinary:</strong> For optimized delivery of job circular images.</li>
                <li><strong>OneSignal:</strong> For reliable push notification delivery.</li>
              </ul>
            </section>

            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                5. Security Measures
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                We implement industry-standard security protocols to protect your personal information from unauthorized access, alteration, or disclosure. We do not sell or share your personal data with third-party advertisers or marketing agencies.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                6. Contact Information
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                If you have any questions or concerns regarding this Privacy Policy or our data practices, please contact us through the "Contact Support" section within the app or email our data protection officer.
              </p>
            </section>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
