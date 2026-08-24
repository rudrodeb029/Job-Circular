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
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Last updated: August 2026</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                1. Information We Collect
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                We collect information you provide directly to us when creating a profile, including your name, mobile number, educational qualification, district location, and target job categories. We also collect activity data such as saved job circulars, applied jobs, and feedback messages you send to our support team.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                2. Data Synchronization & Storage
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Your profile and activity data are synchronized with our secure cloud database (Supabase & Cloudflare) to ensure your information is backed up and can be restored if you reinstall the app. We also use high-performance local caching to store job data on your device for instant offline access.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                3. Push Notifications & Push Token
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                We use OneSignal and Firebase Cloud Messaging (FCM) to send real-time alerts about new job circulars, exam dates, and results. These services process anonymous, unique device push tokens to route alerts to your device. You can opt-out of push notifications at any time via App Settings or system notification settings.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                4. Third-Party Services
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Our application utilizes trusted third-party services to deliver reliable app functionality:
              </p>
              <ul style={{ paddingLeft: '18px', marginTop: '6px', fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><strong>Supabase & Cloudflare Edge CDN:</strong> For database hosting, REST API proxying, and caching.</li>
                <li><strong>OneSignal & FCM:</strong> For real-time push notifications.</li>
                <li><strong>Cloudinary:</strong> For optional profile avatar and job circular image uploads.</li>
              </ul>
            </section>

            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                5. Non-Affiliation Disclaimer
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Live Circular is an independent job notices aggregator. We gather public job notices from official government websites (such as bangladesh.gov.bd, bpsc.gov.bd, mopa.gov.bd, teletalk.com.bd). <strong>Live Circular does NOT represent any government entity.</strong>
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                6. Children's Privacy
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Our app is designed for job seekers aged 13 and older. We do not knowingly collect personal data from children under 13 years of age.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                7. Data Retention & Deletion Rights
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                You have the right to request deletion of your profile data. You can clear local app data via <em>Settings &rarr; Clear Cache</em>, or email your data deletion request to <strong>rudrodeb029@gmail.com</strong>.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                8. Contact Support
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                If you have any questions or concerns regarding this Privacy Policy, please contact our support team at <strong>rudrodeb029@gmail.com</strong> or via the Contact Us section in the app.
              </p>
            </section>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
