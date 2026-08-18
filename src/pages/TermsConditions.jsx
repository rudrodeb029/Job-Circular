import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from '../components/Icons';
import BottomNav from '../components/BottomNav';

export default function TermsConditions() {
  const navigate = useNavigate();

  return (
    <div className="page" style={{ background: 'var(--bg-secondary)' }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ fontSize: '15px', fontWeight: 800 }}>Terms & Conditions</h1>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
        <div className="card" style={{ marginBottom: '20px', borderRadius: '24px', borderTop: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '10px', background: 'var(--primary-bg)', borderRadius: '12px', color: 'var(--primary)' }}>
              <FileText size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Terms of Service</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Effective: July 2026</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                1. Disclaimer of Affiliation
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Job Circulars BD is an independent, non-governmental platform. We are NOT affiliated with the Government of Bangladesh or any specific government agency. All information provided in the app is for educational and informational purposes only.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                2. Information Accuracy
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                We aggregate job circulars, exam dates, and results from public official gazettes, official portals, and national newspapers. While we strive for 100% accuracy, users are required to verify all details on official government websites or the original circular before submitting any job application.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                3. User Obligations
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                By using this app, you agree to provide accurate information in your user profile. Commercial misuse of images, links, or automated data extraction from this application is strictly prohibited.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                4. Limitation of Liability
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                We are not responsible for any issues arising from technical errors on official job application sites, changes in recruitment deadlines, or delays in push notification delivery.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                5. Acceptance of Terms
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                By accessing or using the Job Circulars BD app, you acknowledge that you have read, understood, and agreed to be bound by these terms. We reserve the right to update these terms at any time without prior notice.
              </p>
            </section>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
